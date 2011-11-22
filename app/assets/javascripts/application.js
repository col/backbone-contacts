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

//    _.templateSettings = {
//      interpolate: /\{\{(.+?)\}\}/g,
//        evaluate: /\{\{\=(.+?)\}\}/g
//    };

    window.Contact = Backbone.Model.extend({
        initialize: function() {
//            alert('Contact init!');
        },
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
        }
    });

    window.ContactsList = Backbone.Collection.extend({
        model: Contact,
        url: '/contacts',
        initialize: function() {
        }
    });

    window.ContactListView = Backbone.View.extend({
        initialize: function() {
            this.render();
            this.collection.bind("change", this.on_change, this);
            this.collection.bind("add", this.on_add, this);
            this.collection.bind("remove", this.on_remove, this);
            this.collection.bind("destroy", this.on_destroy, this);
            this._childViews = {};

            // Load the existing items
            collection = this;
            this.collection.each( function(model) {
                collection.on_add(model);
            });
        },
        events: {

        },
        render: function() {
//            this.el.html( ich.players({player_count: this.collection.length}) );
//            this.updateList(this.collection)
        },
//        updateList: function(items) {
//            $('#contact-list').empty();
//            collection = this
//            _.each(items, function(item) {
//                view = collection._childViews[item.cid];
//                $('#contact-list').append( view.el );
//            });
//        },
        on_change: function(model) {
            alert("contact changed!");
        }
        ,
        on_add: function(model) {
            alert("contact added! - "+model);
            view = new ContactItemView({model: model});
            this._childViews[model.cid] = view;
        },
        on_remove: function(model) {
            alert("contact removed!");
            this._childViews[model.cid].remove();
        },
        on_destroy: function(model) {
            alert("contact destroyed!");
            this._childViews[model.cid].remove();
        }
    });

    window.ContactItemView = Backbone.View.extend({
//        tagName: 'li',
        tagName: 'tr',
        className: 'content-item',
//        template: _.template($('#contact-item-template').html()),
//        template: ,
        events: {
        },
        initialize: function() {
//            alert('ContactItemView init!');
            $('#contact-list').append( this.el );
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
            this.render();
        },
        render: function() {
//            $(this.el).html(this.template(this.model.toJSON()));
//            alert("Contact item view render - "+this.model.get('first_name'));
//            template = ich.contact({first_name: "First Name"});
            template = ich.contact_table_item( this.model.toJSON() );
//            alert("iCanHaz = "+template);
//            $(this.el).html( ich.contact_item_template(this.model.toJSON()) );
//            $(this.el).html( ich.contact({first_name: this.model.get('first_name')}) );
            $(this.el).html( template );
        }
    });

    window.Contacts = new ContactsList;
    window.Contacts.fetch({ success: function() {
        window.MyContactList = new ContactListView({ collection: window.Contacts, el: $("#contact-list") });
    }});

});
