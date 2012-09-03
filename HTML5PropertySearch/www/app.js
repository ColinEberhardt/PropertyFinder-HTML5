/// <reference path="..//intellisense.js" />

/*global $, PropertyDataSource, PropertySearchViewModel, Location, PropertyViewModel, hydrateObject, ko, Model, ViewModel, window, localStorage, document, console*/

// globals
var application,
  propertySearchViewModel = null,
  propertyDataSource = new Model.PropertyDataSource({
    dataSource: new Model.JSONDataSource()
  });


function notifyNativeCode(notification) {
  if ($.browser.mozilla) {
    console.log("notifyNativeCode: " + notification);
  } else {
    window.external.Notify(notification);
  }
}

// save app state to persistent storage
function persistentStateChanged() {
  console.log("========= state changed");

  var state = {
      recentSearches : propertySearchViewModel.recentSearches,
      favourites: propertySearchViewModel.favourites,
      locationEnabled : propertySearchViewModel.locationEnabled
    },
    jsonState = ko.toJSON(state);

  localStorage.setItem("state", jsonState);
}

 
// wire up event handlers for various UI elements
function wireUpUI() {
  $(".appBar .more").click(function () {
    var appBar = $(".appBar");
    if (appBar.css("height") !== "80px") {
      appBar.animate({ height: 80 }, { duration: 300});
    }
  });

  $(".appBar").click(function () {
    var appBar = $(".appBar");
    if (appBar.css("height") === "80px") {
      appBar.animate({ height: 63 }, { duration: 300});
    }
  });
}

// restore saved state
function setState(jsonState) {
  var state = $.parseJSON(jsonState);
  if (!state) {
    return;
  }
  if (state.favourites) {
    $.each(state.favourites, function () {
      propertySearchViewModel.favourites.push(hydrateObject(this));
    });
  }
  if (state.recentSearches) {
    $.each(state.recentSearches, function () {
      propertySearchViewModel.recentSearches.push(hydrateObject(this));
    });
  }
  if (state.locationEnabled !== undefined) {
    propertySearchViewModel.locationEnabled(state.locationEnabled);
  }
}

function onBackButton() {
  application.back();
}

function initializeViewModel() {

  console.log("------------------ Creating VMs");

  // create the view model
  application = new ViewModel.ApplicationViewModel();

  // subscribe to changes in the current view model, creating
  // the required view
  application.currentViewModel.subscribe(function (viewModel) {
    if (viewModel !== undefined) {
      $("#app").empty();
      $("#" + viewModel.template).tmpl("").appendTo("#app");
      wireUpUI();
      ko.applyBindings(viewModel);

      // disable scrolling if the current content does not require it
      var disableScroll = $(".content").hasClass("noScroll");
      notifyNativeCode("scrollDisabled:" + disableScroll);
    }
  });


  // handle back button
  application.backButtonRequired.subscribe(function (backButtonRequired) {
    if (backButtonRequired) {
      document.addEventListener("backbutton", onBackButton, false);
    } else {
      document.removeEventListener("backbutton", onBackButton, false);
    }
  });

  // create the top-level view model
  propertySearchViewModel = new ViewModel.PropertySearchViewModel();
  application.navigateTo(propertySearchViewModel);
  
  // check for the presence of tombstoned application state
  notifyNativeCode("getTombstoneState");

  // load application state
  try {
    var state = localStorage.getItem("state");
    console.log("loading state:" + state);
    if (typeof (state) === 'string') {
      setState(state);
    }
  } catch (err) {
  }
  
  // handle changes in persistent state
  propertySearchViewModel.favourites.subscribe(persistentStateChanged);
  propertySearchViewModel.recentSearches.subscribe(persistentStateChanged);
  propertySearchViewModel.locationEnabled.subscribe(persistentStateChanged);

  notifyNativeCode("hideSplashscreen");
}

function getTombstoneState() {
  return application.getState();
}

function restoreTombstoneState(state) {
  return application.setState(state);
}

$(document).ready(function () {
  if (window.device) {
    document.addEventListener("deviceready", initializeViewModel, false);
  } else {
    // if there is no 'device' immediately create the view mdoels.
    initializeViewModel();
  }
});
