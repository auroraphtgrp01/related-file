package com.yucheng.smarthealthpro.home.activity.sleep.fragment;

import android.content.Context;
import android.view.View;
import androidx.core.widget.NestedScrollView;
import butterknife.BindView;
import butterknife.ButterKnife;
import com.yucheng.smarthealthpro.base.BaseLazyLoadFragment;
import com.yucheng.smarthealthpro.customchart.charts.BarChart;
import com.yucheng.smarthealthpro.customchart.charts.LineChart;
import com.yucheng.smarthealthpro.customchart.sleep.SleepBarChartUtils;
import com.yucheng.smarthealthpro.home.activity.sleep.bean.SleepDayInfo;
import com.yucheng.smarthealthpro.home.activity.sleep.bean.SleepHisListBean;
import com.zhuoting.healthyucheng.R;
import java.util.List;

/* loaded from: classes3.dex */
public class SleepTabFragment extends BaseLazyLoadFragment {
    private List<SleepDayInfo> mDaySleepDataBeans;
    private List<SleepHisListBean> mMonthSleepChartHisListBean;
    private NestedScrollView mNestedScrollView;

    @BindView(R.id.line_chart_day)
    LineChart mSleepDayChart;

    @BindView(R.id.bar_chart_month)
    BarChart mSleepMonthChart;

    @BindView(R.id.bar_chart_week)
    BarChart mSleepWeekChart;
    private String mTitles;
    private List<SleepHisListBean> mWeekSleepChartHisListBean;
    private int monthData;
    private Integer position;
    private int mDayXLabelCount = 2;
    private int mDayYLabelCount = 7;
    private int mWeekXLabelCount = 6;
    private int mWeekYLabelCount = 7;
    private int mMonthXLabelCount = 2;
    private int mMonthYLabelCount = 7;
    private float xDayMaximum = 48.0f;
    private float xDayMinimum = 0.0f;
    private float xWeekMaximum = 7.0f;
    private float xWeekMinimum = 0.0f;
    private float xMonthMaximum = 30.0f;
    private float xMonthMinimum = 0.0f;
    private float yMaximum = 140.0f;
    private float yMinimum = 0.0f;

    @Override // com.yucheng.smarthealthpro.framework.BaseFragment
    protected void initData(Context context) {
    }

    @Override // com.gyf.immersionbar.components.ImmersionOwner
    public void initImmersionBar() {
    }

    @Override // com.yucheng.smarthealthpro.framework.BaseFragment
    protected int initLayout() {
        return R.layout.fragment_sleeptab;
    }

    public static SleepTabFragment newInstance(String str, int i2, NestedScrollView nestedScrollView, int i3, List<SleepDayInfo> list, List<SleepHisListBean> list2, List<SleepHisListBean> list3) {
        SleepTabFragment sleepTabFragment = new SleepTabFragment();
        sleepTabFragment.mTitles = str;
        sleepTabFragment.position = Integer.valueOf(i2);
        sleepTabFragment.monthData = i3;
        sleepTabFragment.mNestedScrollView = nestedScrollView;
        sleepTabFragment.mDaySleepDataBeans = list;
        sleepTabFragment.mWeekSleepChartHisListBean = list2;
        sleepTabFragment.mMonthSleepChartHisListBean = list3;
        return sleepTabFragment;
    }

    @Override // com.yucheng.smarthealthpro.framework.BaseFragment
    protected void initView(View view) {
        ButterKnife.bind(this, view);
    }

    @Override // com.yucheng.smarthealthpro.base.BaseLazyLoadFragment
    protected void lazyLoadData() {
        if (this.mTitles.equals(getString(R.string.date_month_unit))) {
            this.mSleepDayChart.setVisibility(8);
            this.mSleepWeekChart.setVisibility(8);
            this.mSleepMonthChart.setVisibility(0);
            SleepBarChartUtils.initBarChart(this.mSleepMonthChart, this.context, this.mMonthSleepChartHisListBean, this.mNestedScrollView, this.yMaximum, this.yMinimum, this.xMonthMaximum, this.mMonthXLabelCount, SleepBarChartUtils.FORMATTER.MONTH);
            return;
        }
        if (this.mTitles.equals(getString(R.string.date_week_unit))) {
            this.mSleepDayChart.setVisibility(8);
            this.mSleepWeekChart.setVisibility(0);
            this.mSleepMonthChart.setVisibility(8);
            SleepBarChartUtils.initBarChart(this.mSleepWeekChart, this.context, this.mWeekSleepChartHisListBean, this.mNestedScrollView, this.yMaximum, this.yMinimum, this.xWeekMaximum, this.mWeekXLabelCount, SleepBarChartUtils.FORMATTER.WEEK);
            return;
        }
        this.mSleepDayChart.setVisibility(0);
        this.mSleepWeekChart.setVisibility(8);
        this.mSleepMonthChart.setVisibility(8);
        SleepBarChartUtils.initSleepChart(this.mSleepDayChart, this.context, this.mDaySleepDataBeans, this.mNestedScrollView, this.yMaximum, this.yMinimum, this.xDayMaximum, this.mDayXLabelCount, SleepBarChartUtils.FORMATTER.DAY);
    }
}
