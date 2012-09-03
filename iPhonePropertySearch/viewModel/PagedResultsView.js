/*globals $ PropertyDataSource JSONFileDataSource Location PropertyViewModel ViewModel ko */


ViewModel.PagedResultsView = function() {

	this.totalPages = ko.observable(0);
	this.totalResults = ko.observable(0);
	this.pageSize = ko.observable(20);
	this.currentPage = ko.observable(0);
	this.fetchFunction = undefined;
	this.items = ko.observableArray();
	
	var that = this;
	
	this.canMoveFirst = ko.dependentObservable(function () {
		return this.currentPage() !== 1;
	}, this);
	
	this.canMoveNext = ko.dependentObservable(function () {
		return this.currentPage() < this.totalPages();
	}, this);
	
	this.canMoveLast = ko.dependentObservable(function () {
		return this.currentPage() !== this.totalPages();
	}, this);
	
	this.canMovePrevious = ko.dependentObservable(function () {
		return this.currentPage() > 1;
	}, this);
	
	function updateCurrentPage(newPage) {
		that.currentPage(newPage);
		that.fetchFunction(that.currentPage(), function(results) {
			that.items.removeAll();
			$.each(results, function() {
				that.items.push(this);
			});
		});
	}
	
	// public functions
	this.init = function(totalResults, results, fetchFunction) {
		this.fetchFunction = fetchFunction;
		this.totalResults(totalResults);
		this.totalPages(Math.ceil(totalResults / this.pageSize()));
		this.currentPage(1);
		this.items.removeAll();
		$.each(results, function() {
			that.items.push(this);
		});
	};
	
	this.moveFirst = function() {
		updateCurrentPage(1);
	};

	this.moveLast = function() {
		updateCurrentPage(this.totalPages());
	};
		
	this.moveNext = function() {
		if (this.canMoveNext()) {
			updateCurrentPage(this.currentPage() + 1);
		}
	};
	
	this.movePrevious = function() {
		if (this.canMovePrevious()) {
			updateCurrentPage(this.currentPage() - 1);
		}
	};
};