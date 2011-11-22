// This is a manifest file that'll be compiled into including all the files listed below.
// Add new JavaScript/Coffee code in separate files in this directory and they'll automatically
// be included in the compiled file accessible from http://example.com/assets/application.js
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
//= require jquery
//= require jquery_ujs
//= require backbone/underscore
//= require backbone/backbone
//= require_tree .

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
            localStorage.clear();
            localStorage.setItem(this.storeName, JSON.stringify(resp));
            return resp;
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
        render: function() {
            this.renderData(this.collection.models);
        },
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

    window.AppView = Backbone.View.extend({
        el: $("#contacts-app"),
        events: {
            "keyup #search-text": "applyFilter"
        },
        initialize: function() {
            this.input    = this.$("#search-text");

            this.contactList = new ContactsList;
            this.listView = new ContactListView({ collection: this.contactList, el: $("#contact-list") });
            this.contactList.fetchLocal();

//          window.Contacts.fetch({ success: function() {
//              window.MyContactList = new ContactListView({ collection: window.Contacts, el: $("#contact-list") });
//          }});

        },
        applyFilter: function(e) {
            var text = this.input.val();
            this.listView.renderData( this.contactList.search(text) );
        }
    });

});
