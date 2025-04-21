package com.yucheng.smarthealthpro.home.activity.sleep.activity;

import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;
import androidx.core.widget.NestedScrollView;
import androidx.recyclerview.widget.RecyclerView;
import butterknife.Unbinder;
import butterknife.internal.DebouncingOnClickListener;
import butterknife.internal.Utils;
import com.flyco.tablayout.SlidingTabLayout;
import com.haibin.calendarview.CalendarView;
import com.yucheng.smarthealthpro.home.view.NoScrollViewPager;
import com.zhuoting.healthyucheng.R;

/* loaded from: classes3.dex */
public class SleepActivity_ViewBinding implements Unbinder {
    private SleepActivity target;
    private View view7f090292;
    private View view7f0902af;
    private View view7f090408;
    private View view7f090409;
    private View view7f090420;
    private View view7f09052c;

    public SleepActivity_ViewBinding(SleepActivity sleepActivity) {
        this(sleepActivity, sleepActivity.getWindow().getDecorView());
    }

    public SleepActivity_ViewBinding(final SleepActivity sleepActivity, View view) {
        this.target = sleepActivity;
        sleepActivity.mSlidingTabLayout = (SlidingTabLayout) Utils.findRequiredViewAsType(view, R.id.stl_tab, "field 'mSlidingTabLayout'", SlidingTabLayout.class);
        sleepActivity.ivCalendar = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_calendar, "field 'ivCalendar'", ImageView.class);
        sleepActivity.tvCalendar = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_calendar, "field 'tvCalendar'", TextView.class);
        View findRequiredView = Utils.findRequiredView(view, R.id.tv_back_today, "field 'tvBackToday' and method 'onViewClicked'");
        sleepActivity.tvBackToday = (TextView) Utils.castView(findRequiredView, R.id.tv_back_today, "field 'tvBackToday'", TextView.class);
        this.view7f09052c = findRequiredView;
        findRequiredView.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.SleepActivity_ViewBinding.1
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleepActivity.onViewClicked(view2);
            }
        });
        View findRequiredView2 = Utils.findRequiredView(view, R.id.ll_calendar, "field 'llCalendar' and method 'onViewClicked'");
        sleepActivity.llCalendar = (LinearLayout) Utils.castView(findRequiredView2, R.id.ll_calendar, "field 'llCalendar'", LinearLayout.class);
        this.view7f090292 = findRequiredView2;
        findRequiredView2.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.SleepActivity_ViewBinding.2
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleepActivity.onViewClicked(view2);
            }
        });
        sleepActivity.mViewPager = (NoScrollViewPager) Utils.findRequiredViewAsType(view, R.id.vp_tab, "field 'mViewPager'", NoScrollViewPager.class);
        sleepActivity.tvDataFirst = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_first, "field 'tvDataFirst'", TextView.class);
        sleepActivity.tvDataFirstUnit = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_first_unit, "field 'tvDataFirstUnit'", TextView.class);
        sleepActivity.rlDataFirst = (RelativeLayout) Utils.findRequiredViewAsType(view, R.id.rl_data_first, "field 'rlDataFirst'", RelativeLayout.class);
        sleepActivity.tvDataSecond = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_second, "field 'tvDataSecond'", TextView.class);
        sleepActivity.ivDataSecond = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_data_second, "field 'ivDataSecond'", ImageView.class);
        sleepActivity.tvDataSecondUnit = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_second_unit, "field 'tvDataSecondUnit'", TextView.class);
        sleepActivity.llDataSecond = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_data_second, "field 'llDataSecond'", LinearLayout.class);
        sleepActivity.tvDataThirdly = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_thirdly, "field 'tvDataThirdly'", TextView.class);
        sleepActivity.ivDataThirdly = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_data_thirdly, "field 'ivDataThirdly'", ImageView.class);
        sleepActivity.tvDataThirdlyUnit = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_thirdly_unit, "field 'tvDataThirdlyUnit'", TextView.class);
        sleepActivity.llDataThirdly = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_data_thirdly, "field 'llDataThirdly'", LinearLayout.class);
        sleepActivity.tvStartButton = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_start_button, "field 'tvStartButton'", TextView.class);
        sleepActivity.llStartButton = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_start_button, "field 'llStartButton'", LinearLayout.class);
        sleepActivity.tvAnalyse = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_analyse, "field 'tvAnalyse'", TextView.class);
        sleepActivity.tvAnalyseData = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_analyse_data, "field 'tvAnalyseData'", TextView.class);
        sleepActivity.rlAnalyse = (RelativeLayout) Utils.findRequiredViewAsType(view, R.id.rl_analyse, "field 'rlAnalyse'", RelativeLayout.class);
        sleepActivity.ivFirstLeft = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_first_left, "field 'ivFirstLeft'", ImageView.class);
        sleepActivity.tvFirst = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_first, "field 'tvFirst'", TextView.class);
        sleepActivity.ivFirstRight = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_first_right, "field 'ivFirstRight'", ImageView.class);
        View findRequiredView3 = Utils.findRequiredView(view, R.id.rl_first, "field 'rlFirst' and method 'onViewClicked'");
        sleepActivity.rlFirst = (RelativeLayout) Utils.castView(findRequiredView3, R.id.rl_first, "field 'rlFirst'", RelativeLayout.class);
        this.view7f090408 = findRequiredView3;
        findRequiredView3.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.SleepActivity_ViewBinding.3
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleepActivity.onViewClicked(view2);
            }
        });
        sleepActivity.ivSecondLeft = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_second_left, "field 'ivSecondLeft'", ImageView.class);
        sleepActivity.tvSecond = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_second, "field 'tvSecond'", TextView.class);
        sleepActivity.ivSecondRight = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_second_right, "field 'ivSecondRight'", ImageView.class);
        View findRequiredView4 = Utils.findRequiredView(view, R.id.rl_second, "field 'rlSecond' and method 'onViewClicked'");
        sleepActivity.rlSecond = (RelativeLayout) Utils.castView(findRequiredView4, R.id.rl_second, "field 'rlSecond'", RelativeLayout.class);
        this.view7f090420 = findRequiredView4;
        findRequiredView4.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.SleepActivity_ViewBinding.4
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleepActivity.onViewClicked(view2);
            }
        });
        sleepActivity.ivFourthlyLeft = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_fourthly_left, "field 'ivFourthlyLeft'", ImageView.class);
        sleepActivity.tvFourthly = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_fourthly, "field 'tvFourthly'", TextView.class);
        sleepActivity.ivFourthlyRight = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_fourthly_right, "field 'ivFourthlyRight'", ImageView.class);
        View findRequiredView5 = Utils.findRequiredView(view, R.id.rl_fourthly, "field 'rlFourthly' and method 'onViewClicked'");
        sleepActivity.rlFourthly = (RelativeLayout) Utils.castView(findRequiredView5, R.id.rl_fourthly, "field 'rlFourthly'", RelativeLayout.class);
        this.view7f090409 = findRequiredView5;
        findRequiredView5.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.SleepActivity_ViewBinding.5
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleepActivity.onViewClicked(view2);
            }
        });
        sleepActivity.mRecyclerView = (RecyclerView) Utils.findRequiredViewAsType(view, R.id.recycle_view, "field 'mRecyclerView'", RecyclerView.class);
        sleepActivity.mNestedScrollView = (NestedScrollView) Utils.findRequiredViewAsType(view, R.id.nsv, "field 'mNestedScrollView'", NestedScrollView.class);
        sleepActivity.tvYears = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_years, "field 'tvYears'", TextView.class);
        sleepActivity.mCalendarView = (CalendarView) Utils.findRequiredViewAsType(view, R.id.calendarView, "field 'mCalendarView'", CalendarView.class);
        View findRequiredView6 = Utils.findRequiredView(view, R.id.ll_month, "field 'llMonth' and method 'onViewClicked'");
        sleepActivity.llMonth = (LinearLayout) Utils.castView(findRequiredView6, R.id.ll_month, "field 'llMonth'", LinearLayout.class);
        this.view7f0902af = findRequiredView6;
        findRequiredView6.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.SleepActivity_ViewBinding.6
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleepActivity.onViewClicked(view2);
            }
        });
        sleepActivity.llRem = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_data_rem, "field 'llRem'", LinearLayout.class);
        sleepActivity.tvRem = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_rem, "field 'tvRem'", TextView.class);
        sleepActivity.tvTotalSleep = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_total_sleep, "field 'tvTotalSleep'", TextView.class);
        sleepActivity.tvTotalSleepText = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_total_sleep_text, "field 'tvTotalSleepText'", TextView.class);
        sleepActivity.rl_total_sleep = (RelativeLayout) Utils.findRequiredViewAsType(view, R.id.rl_total_sleep, "field 'rl_total_sleep'", RelativeLayout.class);
    }

    @Override // butterknife.Unbinder
    public void unbind() {
        SleepActivity sleepActivity = this.target;
        if (sleepActivity == null) {
            throw new IllegalStateException("Bindings already cleared.");
        }
        this.target = null;
        sleepActivity.mSlidingTabLayout = null;
        sleepActivity.ivCalendar = null;
        sleepActivity.tvCalendar = null;
        sleepActivity.tvBackToday = null;
        sleepActivity.llCalendar = null;
        sleepActivity.mViewPager = null;
        sleepActivity.tvDataFirst = null;
        sleepActivity.tvDataFirstUnit = null;
        sleepActivity.rlDataFirst = null;
        sleepActivity.tvDataSecond = null;
        sleepActivity.ivDataSecond = null;
        sleepActivity.tvDataSecondUnit = null;
        sleepActivity.llDataSecond = null;
        sleepActivity.tvDataThirdly = null;
        sleepActivity.ivDataThirdly = null;
        sleepActivity.tvDataThirdlyUnit = null;
        sleepActivity.llDataThirdly = null;
        sleepActivity.tvStartButton = null;
        sleepActivity.llStartButton = null;
        sleepActivity.tvAnalyse = null;
        sleepActivity.tvAnalyseData = null;
        sleepActivity.rlAnalyse = null;
        sleepActivity.ivFirstLeft = null;
        sleepActivity.tvFirst = null;
        sleepActivity.ivFirstRight = null;
        sleepActivity.rlFirst = null;
        sleepActivity.ivSecondLeft = null;
        sleepActivity.tvSecond = null;
        sleepActivity.ivSecondRight = null;
        sleepActivity.rlSecond = null;
        sleepActivity.ivFourthlyLeft = null;
        sleepActivity.tvFourthly = null;
        sleepActivity.ivFourthlyRight = null;
        sleepActivity.rlFourthly = null;
        sleepActivity.mRecyclerView = null;
        sleepActivity.mNestedScrollView = null;
        sleepActivity.tvYears = null;
        sleepActivity.mCalendarView = null;
        sleepActivity.llMonth = null;
        sleepActivity.llRem = null;
        sleepActivity.tvRem = null;
        sleepActivity.tvTotalSleep = null;
        sleepActivity.tvTotalSleepText = null;
        sleepActivity.rl_total_sleep = null;
        this.view7f09052c.setOnClickListener(null);
        this.view7f09052c = null;
        this.view7f090292.setOnClickListener(null);
        this.view7f090292 = null;
        this.view7f090408.setOnClickListener(null);
        this.view7f090408 = null;
        this.view7f090420.setOnClickListener(null);
        this.view7f090420 = null;
        this.view7f090409.setOnClickListener(null);
        this.view7f090409 = null;
        this.view7f0902af.setOnClickListener(null);
        this.view7f0902af = null;
    }
}
