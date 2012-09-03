using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media.Animation;
using Microsoft.Phone.Controls;
using System.IO;
using LinqToVisualTree;
using System.Diagnostics;
using System.IO.IsolatedStorage;
using System.Device.Location;
using WP7CordovaClassLib;

namespace HTML5PropertySearch
{
  public partial class MainPage : PhoneApplicationPage
  {
    private WebBrowserHelper _browserHelper;

    // Constructor
    public MainPage()
    {
      InitializeComponent();

      phoneGapView.Browser.ScriptNotify += new EventHandler<NotifyEventArgs>(Browser_ScriptNotify);

      // create a location watcher - this is required to ensure that the marketplace certification
      // detects the location capability.
      GeoCoordinateWatcher watcher = new GeoCoordinateWatcher(GeoPositionAccuracy.High);

      _browserHelper = new WebBrowserHelper(phoneGapView.Browser);

    }

    public CordovaView PhoneGapView
    {
      get
      {
        return phoneGapView;
      }
    }

    private void Browser_ScriptNotify(object sender, NotifyEventArgs e)
    {
      if (e.Value.StartsWith("scrollDisabled:"))
      {
        var disabled = e.Value.Substring(15);
        _browserHelper.ScrollDisabled = disabled == "true";
      }

      if (e.Value == "hideSplashscreen")
      {
        Storyboard sb = this.Resources["SplashScreenHideAnim"] as Storyboard;
        sb.Completed += (s, e2) => splash.Visibility = Visibility.Collapsed;
        sb.Begin();
      }

      if (e.Value == "getTombstoneState" && App.Current.TombstoneState != null)
      {
        phoneGapView.Browser.InvokeScript("restoreTombstoneState", new string[] { App.Current.TombstoneState });
      }
    }

  }

}