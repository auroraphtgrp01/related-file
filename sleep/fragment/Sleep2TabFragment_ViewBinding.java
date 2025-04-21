package com.yucheng.smarthealthpro.home.activity.sleep.fragment;

import android.view.View;
import butterknife.Unbinder;
import butterknife.internal.Utils;
import com.yucheng.smarthealthpro.customchart.charts.BarChart;
import com.yucheng.smarthealthpro.view.chart.SleepChart;
import com.zhuoting.healthyucheng.R;

/* loaded from: classes3.dex */
public class Sleep2TabFragment_ViewBinding implements Unbinder {
    private Sleep2TabFragment target;

    public Sleep2TabFragment_ViewBinding(Sleep2TabFragment sleep2TabFragment, View view) {
        this.target = sleep2TabFragment;
        sleep2TabFragment.mSleepDayChart = (SleepChart) Utils.findRequiredViewAsType(view, R.id.line_chart_day, "field 'mSleepDayChart'", SleepChart.class);
        sleep2TabFragment.mSleepWeekChart = (BarChart) Utils.findRequiredViewAsType(view, R.id.bar_chart_week, "field 'mSleepWeekChart'", BarChart.class);
        sleep2TabFragment.mSleepMonthChart = (BarChart) Utils.findRequiredViewAsType(view, R.id.bar_chart_month, "field 'mSleepMonthChart'", BarChart.class);
    }

    @Override // butterknife.Unbinder
    public void unbind() {
        Sleep2TabFragment sleep2TabFragment = this.target;
        if (sleep2TabFragment == null) {
            throw new IllegalStateException("Bindings already cleared.");
        }
        this.target = null;
        sleep2TabFragment.mSleepDayChart = null;
        sleep2TabFragment.mSleepWeekChart = null;
        sleep2TabFragment.mSleepMonthChart = null;
    }
}
