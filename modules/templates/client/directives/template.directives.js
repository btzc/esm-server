'use strict';
/*

	Document Templates
	==================
	-------------------------------------------------------------------------

	Template meta-data structure

	-------------------------------------------------------------------------
	This is the way that the template is stored
	{
		documentType  : { type:String, default: '' , index:true},
		versionNumber : { type:Number, default:0, index:true },
		sections      : [{
			name     : { type:String, default:'' },
			optional : { type:Boolean, default:false },
			multiple : { type:Boolean, default:false },
			isheader : { type:Boolean, default:false },
			isfooter : { type:Boolean, default:false },
			template : { type:String, default:'' },
			header   : { type:String, default:'' },
			footer   : { type:String, default:'' },
			meta     : [{
				name     : { type:String, default:'' },
				type     : { type:String, default:'Text', enum:['Text', 'Html'] },
				label    : { type:String, default:'' },
				default  : { type:String, default:'' }
			}]
		}]
	}

	Whereby a section is flat (no repeating portions), or has a header and footer
	with a repeating middle section.

	-------------------------------------------------------------------------

	Template DATA structure

	-------------------------------------------------------------------------
	When data is recorded against a template itwill be stored in a format that
	matches the template structure
	{
		sectionName : {
			name : value,
			name : value,
		},
		sectionName : [{
			name : value,
			name : value,
		}]

	}

	Where a flat section merely has named data elements, while a repeating
	section has those for the header and footer, but has a data array with
	one object full of named data elements for each repeated section

	-------------------------------------------------------------------------

	Generating display template

	-------------------------------------------------------------------------
	The display template should be the simplest to create. The section
	templates need to be strung together in order and the various repeating
	mechanisms need to be created so that they will work with normal angular
	templating.  That is, no real logic, just binding and repeats.

	since sections are meant to be repeated without adding unecessary elements
	which could inadvertently upset the intendedrendering and flow of the
	template we will use the following:

	<div ng-if="0" ng-repeat-start="var in vars"></div>
	<div ng-if="0" ng-repeat-end></div>

	-------------------------------------------------------------------------

	Generating display template

	-------------------------------------------------------------------------


*/
angular.module ('templates')

// -------------------------------------------------------------------------
//
// directive for listing templates
//
// -------------------------------------------------------------------------
.directive ('tmplTemplateRender', function ($compile, templateCompile, templateData, $location, $anchorScroll, _) {
	return {
		restrict: 'E',
		scope: {
			template: '=',
			document: '=',
			mode:     '@'
		},
		link: function (scope, element, attrs) {
			var usemode = scope.mode;
			if (scope.mode === 'print') {
				usemode = 'view';
			}
			var template = templateCompile (scope.template, usemode);
			var wrapperClass= 'template';
			// var header = {
			// 	edit : '<div class="row">'+
			// 		'<div class="col-sm-6">'+
			// 		'<div class="form-group">'+
			// 		'<label for="gg" class="control-label">Go to Section</label>'+
			// 		'<select ng-change="goto(gosection)" id="gg" ng-model="gosection" class="form-control" ng-options="section.name as section.label for section in allsections"></select>'+
			// 		'</div>'+
			// 		'</div>'+
			// 		'<div class="col-sm-6">'+
			// 		'<div class="form-group">'+
			// 		'<label for="hh" class="control-label">Append New in Section</label>'+
			// 		'<select ng-change="append(newsection)" id="hh" ng-model="newsection" class="form-control" ng-options="section.name as section.label for section in repeatsections"></select>'+
			// 		'</div>'+
			// 		'</div>'+
			// 		'</div>',
			// 	view : '<div class="row">'+
			// 		'<div class="col-sm-6">'+
			// 		'<div class="form-group">'+
			// 		'<label for="gg" class="control-label">Go to Section</label>'+
			// 		'<select ng-change="goto(gosection)" id="gg" ng-model="gosection" class="form-control" ng-options="section.name as section.label for section in allsections"></select>'+
			// 		'</div>'+
			// 		'</div>'+
			// 		'<div class="col-sm-6">&nbsp;</div>'+
			// 		'</div>'
			// };




			var header = {
				edit:'<div class="panel panel-default" ng-init="toggleBlue = true">'+
					'<div class="panel-body no-vertical-padding" du-scroll-container="templateContainer"><div class="row block-section">'+
					'<div class="col-sm-3 col-no-padding vertical-scroll col-border-right">'+
					'<ul class="small list-unstyled list-documents">'+
					'<li>'+
					'<a href ng-click="toggleBlue = !toggleBlue">Toggle Outlines</a>'+
					'</li>'+
					'<li class="row-folder clickable" du-scrollspy="{{ section.name }}" ng-repeat="section in allsections">'+
					'<a href ng-if="section.repeatable" ng-click="append(section.name)" class="pull-right">+ Append New</a>'+					
					'<a href="#{{ section.name }}" du-smooth-scroll>{{ section.label }}</a></li>'+
					'</ul>'+
					'</div>'+
					'<div class="col-sm-9 vertical-scroll-padded" id="templateContainer" ng-class="{\'edit-outlines\': toggleBlue}">',
				view: 
					'<div class="panel panel-default">'+
					'<div class="panel-body no-vertical-padding" du-scroll-container="templateContainer"><div class="row block-section">'+
					'<div class="col-sm-3 col-no-padding vertical-scroll col-border-right">'+
					'<ul class="small list-unstyled list-documents">'+
					'<li class="row-folder clickable" du-scrollspy="{{ section.name }}" ng-repeat="section in allsections">'+
					'<a href="#{{ section.name }}" x-offset=10 du-smooth-scroll>{{ section.label }}</a></li>'+
					'</ul>'+
					'</div>'+
					'<div class="col-sm-9 vertical-scroll-padded" id="templateContainer">'
			};

			var footer = '</div></div></div></div>';

			var tData = templateData (scope.template, scope.document);
			scope.allsections = tData.sectionList ();
			// console.log (scope.allsections);
			// scope.repeatsections = tData.repeatable ();
			scope.gosection = '';
			scope.newsection = '';
			// scope.goto = function (sectionname) {
			// 	// console.log ('goto ', sectionname);
			// 	$location.hash (sectionname);
			// 	$anchorScroll ();
			// 	scope.gosection = '';
			// };
			scope.append = function (sectionname) {
				// console.log ('append ', sectionname);
				tData.push (sectionname);
				scope.newsection = '';
				// console.log ('document = ',scope.document);
				// console.log ('tdata    = ',tData.document);
			};

			template = header[usemode]+'<div class="'+wrapperClass+'">'+template+'</div>'+footer;
			// console.log ('template = ', template);
			element.html (template);
			$compile (element.contents())(scope);
		}
	};
})

// -------------------------------------------------------------------------
//
// directive to edit text field in template
//
// -------------------------------------------------------------------------
.directive('contentInline', ['$sce', function($sce) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController,
		scope: {
			// default: '=',
			curVal: '=ngModel'
		},
		replace: true,
		template: '<span class="text-block" contenteditable="true"></span>',
		link: function(scope, element, attrs, ngModel) {
			if (!ngModel) return; // do nothing if no ng-model

			// element.html($sce.getTrustedHtml(scope.curVal || scope.default || ''));
			element.html($sce.getTrustedHtml(scope.curVal || ''));

			// Specify how UI should be updated
			ngModel.$render = function() {
            	element.html($sce.getTrustedHtml(ngModel.$viewValue));
			};

			// Listen for change events to enable binding
			element.on('blur keyup change', function() {
				scope.$evalAsync(read);
			});
			read(); // initialize

			// Write data to the model
			function read() {
				var html = element.html() || ngModel.$modelValue;
				// When we clear the content editable the browser leaves a <br> behind
				// If strip-br attribute is provided then we strip this out
				if ( attrs.stripBr && html === '<br>' ) {
					html = '';
				}
				element.html($sce.getTrustedHtml( html ));
				ngModel.$setViewValue(html);
			}
		}
	};
}])
// -------------------------------------------------------------------------
//
// directive to edit html field in template
//
// -------------------------------------------------------------------------
.directive('contentHtml', ['$sce', function($sce) {
	return {
		restrict: 'A', // only activate on element attribute
		require: '?ngModel', // get a hold of NgModelController
		scope: {
			// default: '=',
			curVal: '=ngModel'
		},
		replace: true,
		templateUrl: 'modules/templates/client/views/template-html-editor.html',
		link: function(scope, element, attrs, ngModel) {
			// if (!ngModel) return; // do nothing if no ng-model

			// if (ngModel.$isEmpty(scope.curVal)) {
			// 	scope.curVal = scope.default;
			// }

			scope.activeItem = false;

			// scope.saveModel = function() {
			// 	console.log('savemodel');
			// 	scope.$evalAsync(read);
			// };
			// // Listen for change events to enable binding
			// element.on('blur keyup change', function() {
			// 	scope.$evalAsync(read);
			// });
			// read(); // initialize

			// // Write data to the model
			// function read() {
			// 	ngModel.$setViewValue(scope.curVal);
			// }
		}
	};
}])


;

