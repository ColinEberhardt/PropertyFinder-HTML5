/// <reference path="..//intellisense.js" />

/*global $, Model */

Model.Property = function (config) {
  /// <summary>
  /// A model that represents a single property listing.
  /// </summary>
  this.guid = config.guid;
  this.price = config.price;
  this.bedrooms = config.bedrooms;
  this.bahrooms = config.bathrooms;
  this.propertyType = config.propertyType;
  this.title = config.title;
  this.thumbnailUrl = config.thumbnailUrl;
  this.imgUrl = config.imgUrl;
};
