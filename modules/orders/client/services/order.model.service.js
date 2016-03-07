
'use strict';
// =========================================================================
//
// this is the data model (service). This is how all data
// is accessed through the front end
//
// =========================================================================
angular.module('orders').factory ('OrderModel', function (ModelBase, _) {
	//
	// build the model by extending the base model. the base model will
	// have all the basic crud stuff built in
	//
	var Class = ModelBase.extend ({
		urlName : 'order',
		forProject: function (projectid) {
			return this.get ('/api/order/for/project/'+projectid);
		},
	});
	return new Class ();
});


