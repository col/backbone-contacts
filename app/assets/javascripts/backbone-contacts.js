/**
 * User: Col
 * Date: 23/11/11
 * Time: 11:41 AM
 */

$(function(){

    window.Contact = Backbone.Model.extend({
        url: '/contacts',
        defaults: {
            "first_name": "First Name",
            "last_name": "Last Name",
            "address1": "Address1",
            "address2": "Address2",
            "city": "City",
            "state": "State",
            "postcode": "Postcode",
            "country": "Country"
        },
        searchContent: function() {
            return _(this.attributes).values().join(' ');
        }
    });

    window.ContactsList = Backbone.Collection.extend({
        model: Contact,
        url: '/contacts',
        storeName: "contacts",
        parse : function(resp, xhr) {
            // Cache the remote content in localStorage
            localStorage.setItem(this.storeName, JSON.stringify(resp));
            return resp;
        },
        load: function(options) {
            if( localStorage.getItem(this.storeName) ) {
                this.fetchLocal(options);
                // TODO: Implement an update function to check the server for changes.
//                this.update(options);
            } else {
                this.fetch(options);
            }
        },
        fetchLocal: function(options) {
            options = options || {};
            var resp = localStorage.getItem(this.storeName);
            resp = JSON.parse(resp);
            this.reset(resp, options);
            if (options.success) options.success(this, resp);
        },
        search: function(searchText) {
            return this.filter(function(model) {
                return model.searchContent().indexOf(searchText) != -1;
            });
        }
    });

    window.ContactListView = Backbone.View.extend({
        initialize: function() {
            _.bindAll(this, 'render', 'renderData', 'addOne');
            this.collection.bind("add", this.addOne);
            this.collection.bind("reset", this.render);
            this._childViews = {};
        },
//        render: function() {
//            this.renderData(this.collection.models);
//        },
        renderData: function(data) {
            // Clear the table
            $(this.el).html( ich.contact_table() );

            // Add the data to the able
            _.each(data, function(task) {
                this.addOne(task);
            }, this);

            return this;
        },
        addOne: function(model) {
            // Check for an existing view
            var view = this._childViews[model.cid];
            if( !view ) {
                // create new view if required
                view = new ContactItemView({ model:model });
                this._childViews[model.cid] = view;
            }
            // add the view to the list
            $(this.el).append( view.render().el );
        }
    });

    window.ContactItemView = Backbone.View.extend({
        tagName: 'tr',
        className: 'content-item',
        events: {
        },
        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
        },
        render: function() {
            $(this.el).html( ich.contact_table_item( this.model.toJSON() ) );
            return this;
        }
    });

    // TODO: separate the pagination code form this view
    window.AppView = Backbone.View.extend({
        perPage: 5,
        currentPage: 1,
        totalPages: 1,
        totalRows: 1,
        el: $("#contacts-app"),
        events: {
            "keyup #search-text": "applyFilter",
            "click #reload": "reload",
            "click .next": "gotoNext",
            "click .prev": "gotoPrev",
            "click .page a": "pageClicked"
        },
        initialize: function() {
            _.bindAll(this, 'gotoPage', 'gotoNext', 'gotoPrev', 'initPagination');
            this.input    = this.$("#search-text");
            //TODO: refactor the Backbone collections so that there's 1 master collection and another filtered collection which is bound to the view.
            this.contactList = new ContactsList;
            this.listView = new ContactListView({ collection: this.contactList, el: $("#contact-list") });
            this.contactList.load({ success: this.gotoPage });
        },
        initPagination: function() {
            this.totalRows = this.contactList.models.length;
            this.totalPages = Math.round( (this.totalRows / this.perPage) + 0.49 );
        },
        pageClicked: function(e) {
            var page = $(e.target).text();
            if( !isNaN(page) )
                this.gotoPage(page);
            return false;
        },
        gotoPage: function(page) {
            this.initPagination();
            this.currentPage = isNaN(page) ? 1 : parseInt(page);
            var startIndex = (this.currentPage - 1) * this.perPage;
            var endIndex = startIndex + this.perPage;
            this.listView.renderData( this.contactList.models.slice(startIndex, endIndex) );
            this.render();
        },
        gotoNext: function() {
            if( this.currentPage < this.totalPages )
                this.gotoPage(this.currentPage+1);
            return false;
        },
        gotoPrev: function(e) {
            if( this.currentPage > 1 )
                this.gotoPage(this.currentPage-1);
            return false;
        },
        applyFilter: function(e) {
            var text = this.input.val();
            this.listView.renderData( this.contactList.search(text) );
        },
        reload: function(e) {
            this.contactList.fetch({ success: this.gotoPage(1) });
        },
        render: function() {
            var pagination = $('#pagination');

            // Clear the pagination
            $('#pagination').html('');

            // TODO: refactor this code, it's a bit of a mess
            var className = this.currentPage == 1 ? "disabled" : "";
            pagination.append( ich.pagination_item({class: "prev "+className, content: "&larr; Previous"}) );

            var pageNumbers = this.windowedPageNumbers();
            var currentPage = this.currentPage;
            $(pageNumbers).each( function(index, pageNum) {
                var className = (pageNum == currentPage) ? "active" : "";
                if( isNaN(pageNum) )
                    className = "disabled";
                pagination.append( ich.pagination_item({class: "page "+className, content: pageNum+""}) );
            });
            className = this.currentPage == this.totalPages ? "disabled" : "";
            pagination.append( ich.pagination_item({class: "next "+className, content: "Next &rarr;"}) );
        },
        // Calculates visible page numbers using the <tt>:inner_window</tt> and
        // <tt>:outer_window</tt> options.
        // (Copied from will_paginate and ported to JavaScript)
        windowedPageNumbers: function(options) {
            options = options || {};
            inner_window = options.inner_window ? options.inner_window : 2;
            outer_window = options.outer_window ? options.outer_window : 2;
            window_from = this.currentPage - inner_window;
            window_to = this.currentPage + inner_window;

            // adjust lower or upper limit if other is out of bounds
            if( window_to > this.totalPages ) {
                window_from -= window_to - this.totalPages;
                window_to = this.totalPages;
            }

            if( window_from < 1 ) {
                window_to += (1 - window_from);
                window_from = 1;
                if( window_to > this.totalPages ) {
                    window_to = this.totalPages;
                }
            }

            // these are always visible
            middle = Number.range(window_from, window_to+1);

            // left window
            if( outer_window + 3 < middle[0] ) {
                // there's a gap
                left = Number.range(1, (outer_window + 1));
                left.push('...');
            } else {
                // runs into visible pages
                left = Number.range(1, middle[0]);
            }

            // right window
            if( this.totalPages - outer_window - 2 >= middle[middle.length-1] ) {
                // again, gap
                right = Number.range((this.totalPages - outer_window)+1, this.totalPages+1);
                right.unshift('...');
            } else {
                //runs into visible pages
                right = Number.range((middle[middle.length-1]+1), this.totalPages+1);
            }

            return left.concat(middle, right);
        }
    });

});