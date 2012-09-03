/*global $, PropertyDataSource, PropertySearchViewModel, Location, PropertyViewModel, hydrateObject, ko, iScroll, Model, ViewModel, window, localStorage, document, console*/


// globals
var application,
    rootFileSystem,
    myScroll,
    previousStackSize = 0,
    propertySearchViewModel = null,
    propertyDataSource = new Model.PropertyDataSource({
      dataSource: new Model.JSONDataSource()
    });

function fadeImages() {
  $("img.ui-li-thumb:not(.shown)").bind("load", function () {
    $(this).addClass("shown");
  });
}

function setState(jsonState) {
  var state = $.parseJSON(jsonState);
  if (!state)
    return;
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

  // last / first item state are not persisted, so we have to update
  propertySearchViewModel.updateListStyling(propertySearchViewModel.recentSearches);
}

function persistentStateChanged() {
  var state = {
        recentSearches: propertySearchViewModel.recentSearches,
        favourites: propertySearchViewModel.favourites
      },
      jsonState = ko.toJSON(state);

  localStorage["appState"] = jsonState;
}

function pullUpAction() {
  var vm = application.currentViewModel();
  if (vm.properties().length < vm.totalResults) {
    vm.loadMore();
  }
}

function handleButtonClick(element, suffix) {
  $.each(element, function () {
    $(this).bind("touchstart", function () {
      $(this).addClass("ui-btn-down-" + suffix).removeClass("ui-btn-up-" + suffix);
    });

    $(this).bind("touchend", function () {
      $(this).removeClass("ui-btn-down-" + suffix).addClass("ui-btn-up-" + suffix);
    });
  });
}

function wireUpUI($view) {

  // fade in images as they appear
  fadeImages();

  var $iScroll = $view.find(".iScrollWrapper"),
      $pullUpEl = $view.find(".pullUp"),
      $pullUpLabel, pullUpEl, pullUpOffset;

  // pull-to-refresh, taken from this iScroll demo:
  // http://cubiq.org/dropbox/iscroll4/examples/pull-to-refresh/
  if ($iScroll.length > 0) {

    if ($pullUpEl.length > 0) {

      pullUpEl = $pullUpEl.get(0);
      pullUpOffset = $pullUpEl.attr('offsetHeight');
      $pullUpLabel = $pullUpEl.find(".pullUpLabel");

      myScroll = new iScroll($iScroll.get(0), {
        useTransition: true,
        onRefresh: function () {
          if ($pullUpEl.hasClass('loading')) {
            $pullUpEl.removeClass();
            $pullUpLabel.html('Pull up to load more...');
          }
        },
        onScrollMove: function () {
          if (this.y < (this.maxScrollY - 5) && !$pullUpEl.hasClass('flip')) {
            $pullUpEl.addClass('flip');
            $pullUpLabel.html('Release to refresh...');
            this.maxScrollY = this.maxScrollY;
          } else if (this.y > (this.maxScrollY + 5) && $pullUpEl.hasClass('flip')) {
            $pullUpEl.removeClass("flip");
            $pullUpLabel.html('Pull up to load more...');
            this.maxScrollY = pullUpOffset;
          }
        },
        onScrollEnd: function () {
          if ($pullUpEl.hasClass('flip')) {
            $pullUpEl.addClass("loading");
            $pullUpLabel.html('Loading...');
            pullUpAction();
          }
        }
      });
    } else {
      myScroll = new iScroll($iScroll.get(0), {
        useTransition: true
      });
    }
  }

  handleButtonClick($view.find("div.ui-btn-up-c"), "c");
  handleButtonClick($view.find("a.ui-btn-up-b"), "b");
}

function initializeViewModel() {

  // create the view model
  application = new ViewModel.ApplicationViewModel();

  // create the top-level view model
  propertySearchViewModel = new ViewModel.PropertySearchViewModel();
  propertySearchViewModel.maxRecentSearch = 3;

  ko.applyBindings(application);

  var previousBackStackLength = 0;

  // subscribe to changes in the current view model, creating
  // the required view
  application.currentViewModel.subscribe(function (viewModel) {

    var backStackLength = application.viewModelBackStack().length,
        $view;

    if (viewModel !== undefined) {
      
      if (previousBackStackLength < backStackLength) {

        // hide existing content
        $(".ui-content").children().last().hide();

        // forward navigation
        $view = $("#" + viewModel.template).tmpl().appendTo(".ui-content");
        ko.applyBindings(viewModel, $view.get(0));
        wireUpUI($view);

      } else {
        // backward navigation
        $(".ui-content").children().last().remove();
        $(".ui-content").children().last().show();
      }

      if (viewModel.template === 'searchResultsView') {
        // if a further page of data is fetched, we need to update the iScroll instance.
        viewModel.pageNumber.subscribe(function () {
          myScroll.refresh();
          fadeImages();
        });
      }
    }
    previousBackStackLength = backStackLength;

  });


  // handle changes in persistent state
  propertySearchViewModel.favourites.subscribe(persistentStateChanged);
  propertySearchViewModel.recentSearches.subscribe(persistentStateChanged);

  var state = localStorage["appState"];
  if (state) {
    setState(state);
  }

  application.navigateTo(propertySearchViewModel);

}

$(document).ready(function () {
  document.addEventListener("deviceready", initializeViewModel, false);

  // initialize view models immediately when testing
  if (!window.device) {
    initializeViewModel();
  }
});

















