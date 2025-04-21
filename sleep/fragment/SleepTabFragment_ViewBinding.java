package com.yucheng.smarthealthpro.home.activity.sleep.fragment;

import android.view.View;
import butterknife.Unbinder;
import butterknife.internal.Utils;
import com.yucheng.smarthealthpro.customchart.charts.BarChart;
import com.yucheng.smarthealthpro.customchart.charts.LineChart;
import com.zhuoting.healthyucheng.R;

/* loaded from: classes3.dex */
public class SleepTabFragment_ViewBinding implements Unbinder {
    private SleepTabFragment target;

    public SleepTabFragment_ViewBinding(SleepTabFragment sleepTabFragment, View view) {
        this.target = sleepTabFragment;
        sleepTabFragment.mSleepDayChart = (LineChart) Utils.findRequiredViewAsType(view, R.id.line_chart_day, "field 'mSleepDayChart'", LineChart.class);
        sleepTabFragment.mSleepWeekChart = (BarChart) Utils.findRequiredViewAsType(view, R.id.bar_chart_week, "field 'mSleepWeekChart'", BarChart.class);
        sleepTabFragment.mSleepMonthChart = (BarChart) Utils.findRequiredViewAsType(view, R.id.bar_chart_month, "field 'mSleepMonthChart'", BarChart.class);
    }

    @Override // butterknife.Unbinder
    public void unbind() {
        SleepTabFragment sleepTabFragment = this.target;
        if (sleepTabFragment == null) {
            throw new IllegalStateException("Bindings already cleared.");
        }
        this.target = null;
        sleepTabFragment.mSleepDayChart = null;
        sleepTabFragment.mSleepWeekChart = null;
        sleepTabFragment.mSleepMonthChart = null;
    }
}
