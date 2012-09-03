using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Phone.Controls;
using LinqToVisualTree;
using System.Windows.Input;

namespace HTML5PropertySearch
{
  /// <summary>
  /// Suppresses pinch zoom and optionally scrolling of the WebBrowser control
  /// </summary>
  public class WebBrowserHelper
  {
    private WebBrowser _browser;

    /// <summary>
    /// Gets or sets whether to suppress the scrolling of
    /// the WebBrowser control;
    /// </summary>
    public bool ScrollDisabled { get; set; }

    public WebBrowserHelper(WebBrowser browser)
    {
      _browser = browser;
      browser.Loaded += new RoutedEventHandler(browser_Loaded);
    }

    private void browser_Loaded(object sender, RoutedEventArgs e)
    {
      var border = _browser.Descendants<Border>().Last() as Border;

      border.ManipulationDelta += Border_ManipulationDelta;
      border.ManipulationCompleted += Border_ManipulationCompleted;
      border.DoubleTap += Border_DoubleTap;
    }

    private void Border_DoubleTap(object sender, GestureEventArgs e)
    {
      // suppress double-tap
      e.Handled = true;
    }

    private void Border_ManipulationCompleted(object sender, ManipulationCompletedEventArgs e)
    {
      // suppress zoom
      if (e.FinalVelocities.ExpansionVelocity.X != 0.0 ||
         e.FinalVelocities.ExpansionVelocity.Y != 0.0)
        e.Handled = true;
    }

    private void Border_ManipulationDelta(object sender, ManipulationDeltaEventArgs e)
    {
      // suppress zoom
      if (e.DeltaManipulation.Scale.X != 0.0 ||
          e.DeltaManipulation.Scale.Y != 0.0)
        e.Handled = true;

      // optionally suppress scrolling
      if (ScrollDisabled)
      {
        if (e.DeltaManipulation.Translation.X != 0.0 ||
          e.DeltaManipulation.Translation.Y != 0.0)
          e.Handled = true;
      }
    }


  }
}
