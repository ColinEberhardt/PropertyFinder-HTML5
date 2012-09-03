/// <reference path="..//intellisense.js" />

/*global $, ViewModel */

ViewModel.FavouritesViewModel = function (propertySearchViewModel) {
  /// <summary>
  /// The view model that backs the favourites view
  /// </summary>

  // ----- framework fields
  this.template = "favouritesView";
  this.factoryName = "FavouritesViewModel";
  
  // ----- public fields
  this.properties = propertySearchViewModel.favourites;
};