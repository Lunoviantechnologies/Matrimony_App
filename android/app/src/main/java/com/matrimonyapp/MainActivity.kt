package com.matrimonyapp
import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MatrimonyApp"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /**
   * Override onCreate to set high refresh rate from app start
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableMaxRefreshRate()
  }

  /**
   * Override onResume to aggressively force the high refresh rate every time
   * the app comes to the foreground, bypassing React Native's default 60Hz cap.
   */
  override fun onResume() {
      super.onResume()
      enableMaxRefreshRate()
  }

  /**
   * Enable maximum refresh rate using the proven preferredDisplayModeId method
   */
  private fun enableMaxRefreshRate() {
      try {
          // Android 6.0+ (API 23+) - Set preferred display mode ID
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
              try {
                  val display = windowManager.defaultDisplay
                  val supportedModes = display.supportedModes
                  
                  if (supportedModes.isNotEmpty()) {
                      // Find the display mode with the highest refresh rate
                      var highestRefreshRateMode = supportedModes[0]
                      
                      for (mode in supportedModes) {
                          if (mode.refreshRate > highestRefreshRateMode.refreshRate) {
                              highestRefreshRateMode = mode
                          }
                      }
                      
                      // Apply the highest refresh rate mode
                      val layoutParams = window.attributes
                      layoutParams.preferredDisplayModeId = highestRefreshRateMode.modeId
                      window.attributes = layoutParams
                  }
              } catch (e: Exception) {
                  e.printStackTrace()
              }
          }
      } catch (e: Exception) {
          // Failsafe so the app doesn't crash
          e.printStackTrace()
      }
  }
}