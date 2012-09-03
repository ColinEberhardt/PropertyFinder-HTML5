/// <reference path="..//intellisense.js" />

/*global ViewModel, propertySearchViewModel, $*/


ViewModel.AboutViewModel = function (propertySearchViewModel) {
  /// <summary>
  /// The view model that backs the about page
  /// </summary>

  // ----- framework fields
  
  this.template = "aboutView";
  this.factoryName = "AboutViewModel";

  // ----- public fields
  this.locationEnabled = propertySearchViewModel.locationEnabled;
};