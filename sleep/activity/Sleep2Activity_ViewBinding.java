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
public class Sleep2Activity_ViewBinding implements Unbinder {
    private Sleep2Activity target;
    private View view7f090292;
    private View view7f0902af;
    private View view7f090408;
    private View view7f090409;
    private View view7f090420;
    private View view7f09052c;

    public Sleep2Activity_ViewBinding(Sleep2Activity sleep2Activity) {
        this(sleep2Activity, sleep2Activity.getWindow().getDecorView());
    }

    public Sleep2Activity_ViewBinding(final Sleep2Activity sleep2Activity, View view) {
        this.target = sleep2Activity;
        sleep2Activity.mSlidingTabLayout = (SlidingTabLayout) Utils.findRequiredViewAsType(view, R.id.stl_tab, "field 'mSlidingTabLayout'", SlidingTabLayout.class);
        sleep2Activity.ivCalendar = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_calendar, "field 'ivCalendar'", ImageView.class);
        sleep2Activity.tvCalendar = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_calendar, "field 'tvCalendar'", TextView.class);
        View findRequiredView = Utils.findRequiredView(view, R.id.tv_back_today, "field 'tvBackToday' and method 'onViewClicked'");
        sleep2Activity.tvBackToday = (TextView) Utils.castView(findRequiredView, R.id.tv_back_today, "field 'tvBackToday'", TextView.class);
        this.view7f09052c = findRequiredView;
        findRequiredView.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.Sleep2Activity_ViewBinding.1
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleep2Activity.onViewClicked(view2);
            }
        });
        View findRequiredView2 = Utils.findRequiredView(view, R.id.ll_calendar, "field 'llCalendar' and method 'onViewClicked'");
        sleep2Activity.llCalendar = (LinearLayout) Utils.castView(findRequiredView2, R.id.ll_calendar, "field 'llCalendar'", LinearLayout.class);
        this.view7f090292 = findRequiredView2;
        findRequiredView2.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.Sleep2Activity_ViewBinding.2
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleep2Activity.onViewClicked(view2);
            }
        });
        sleep2Activity.mViewPager = (NoScrollViewPager) Utils.findRequiredViewAsType(view, R.id.vp_tab, "field 'mViewPager'", NoScrollViewPager.class);
        sleep2Activity.tvDataFirst = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_first, "field 'tvDataFirst'", TextView.class);
        sleep2Activity.tvDataFirstUnit = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_first_unit, "field 'tvDataFirstUnit'", TextView.class);
        sleep2Activity.rlDataFirst = (RelativeLayout) Utils.findRequiredViewAsType(view, R.id.rl_data_first, "field 'rlDataFirst'", RelativeLayout.class);
        sleep2Activity.tvDataSecond = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_second, "field 'tvDataSecond'", TextView.class);
        sleep2Activity.ivDataSecond = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_data_second, "field 'ivDataSecond'", ImageView.class);
        sleep2Activity.tvDataSecondUnit = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_second_unit, "field 'tvDataSecondUnit'", TextView.class);
        sleep2Activity.llDataSecond = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_data_second, "field 'llDataSecond'", LinearLayout.class);
        sleep2Activity.tvDataThirdly = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_thirdly, "field 'tvDataThirdly'", TextView.class);
        sleep2Activity.ivDataThirdly = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_data_thirdly, "field 'ivDataThirdly'", ImageView.class);
        sleep2Activity.tvDataThirdlyUnit = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_thirdly_unit, "field 'tvDataThirdlyUnit'", TextView.class);
        sleep2Activity.llDataThirdly = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_data_thirdly, "field 'llDataThirdly'", LinearLayout.class);
        sleep2Activity.tvStartButton = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_start_button, "field 'tvStartButton'", TextView.class);
        sleep2Activity.llStartButton = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_start_button, "field 'llStartButton'", LinearLayout.class);
        sleep2Activity.tvAnalyse = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_analyse, "field 'tvAnalyse'", TextView.class);
        sleep2Activity.tvAnalyseData = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_analyse_data, "field 'tvAnalyseData'", TextView.class);
        sleep2Activity.rlAnalyse = (RelativeLayout) Utils.findRequiredViewAsType(view, R.id.rl_analyse, "field 'rlAnalyse'", RelativeLayout.class);
        sleep2Activity.ivFirstLeft = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_first_left, "field 'ivFirstLeft'", ImageView.class);
        sleep2Activity.tvFirst = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_first, "field 'tvFirst'", TextView.class);
        sleep2Activity.ivFirstRight = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_first_right, "field 'ivFirstRight'", ImageView.class);
        View findRequiredView3 = Utils.findRequiredView(view, R.id.rl_first, "field 'rlFirst' and method 'onViewClicked'");
        sleep2Activity.rlFirst = (RelativeLayout) Utils.castView(findRequiredView3, R.id.rl_first, "field 'rlFirst'", RelativeLayout.class);
        this.view7f090408 = findRequiredView3;
        findRequiredView3.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.Sleep2Activity_ViewBinding.3
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleep2Activity.onViewClicked(view2);
            }
        });
        sleep2Activity.ivSecondLeft = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_second_left, "field 'ivSecondLeft'", ImageView.class);
        sleep2Activity.tvSecond = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_second, "field 'tvSecond'", TextView.class);
        sleep2Activity.ivSecondRight = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_second_right, "field 'ivSecondRight'", ImageView.class);
        View findRequiredView4 = Utils.findRequiredView(view, R.id.rl_second, "field 'rlSecond' and method 'onViewClicked'");
        sleep2Activity.rlSecond = (RelativeLayout) Utils.castView(findRequiredView4, R.id.rl_second, "field 'rlSecond'", RelativeLayout.class);
        this.view7f090420 = findRequiredView4;
        findRequiredView4.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.Sleep2Activity_ViewBinding.4
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleep2Activity.onViewClicked(view2);
            }
        });
        sleep2Activity.ivFourthlyLeft = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_fourthly_left, "field 'ivFourthlyLeft'", ImageView.class);
        sleep2Activity.tvFourthly = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_fourthly, "field 'tvFourthly'", TextView.class);
        sleep2Activity.ivFourthlyRight = (ImageView) Utils.findRequiredViewAsType(view, R.id.iv_fourthly_right, "field 'ivFourthlyRight'", ImageView.class);
        View findRequiredView5 = Utils.findRequiredView(view, R.id.rl_fourthly, "field 'rlFourthly' and method 'onViewClicked'");
        sleep2Activity.rlFourthly = (RelativeLayout) Utils.castView(findRequiredView5, R.id.rl_fourthly, "field 'rlFourthly'", RelativeLayout.class);
        this.view7f090409 = findRequiredView5;
        findRequiredView5.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.Sleep2Activity_ViewBinding.5
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleep2Activity.onViewClicked(view2);
            }
        });
        sleep2Activity.mRecyclerView = (RecyclerView) Utils.findRequiredViewAsType(view, R.id.recycle_view, "field 'mRecyclerView'", RecyclerView.class);
        sleep2Activity.mNestedScrollView = (NestedScrollView) Utils.findRequiredViewAsType(view, R.id.nsv, "field 'mNestedScrollView'", NestedScrollView.class);
        sleep2Activity.tvYears = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_years, "field 'tvYears'", TextView.class);
        sleep2Activity.mCalendarView = (CalendarView) Utils.findRequiredViewAsType(view, R.id.calendarView, "field 'mCalendarView'", CalendarView.class);
        View findRequiredView6 = Utils.findRequiredView(view, R.id.ll_month, "field 'llMonth' and method 'onViewClicked'");
        sleep2Activity.llMonth = (LinearLayout) Utils.castView(findRequiredView6, R.id.ll_month, "field 'llMonth'", LinearLayout.class);
        this.view7f0902af = findRequiredView6;
        findRequiredView6.setOnClickListener(new DebouncingOnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.activity.Sleep2Activity_ViewBinding.6
            @Override // butterknife.internal.DebouncingOnClickListener
            public void doClick(View view2) {
                sleep2Activity.onViewClicked(view2);
            }
        });
        sleep2Activity.llRem = (LinearLayout) Utils.findRequiredViewAsType(view, R.id.ll_data_rem, "field 'llRem'", LinearLayout.class);
        sleep2Activity.tvRem = (TextView) Utils.findRequiredViewAsType(view, R.id.tv_data_rem, "field 'tvRem'", TextView.class);
    }

    @Override // butterknife.Unbinder
    public void unbind() {
        Sleep2Activity sleep2Activity = this.target;
        if (sleep2Activity == null) {
            throw new IllegalStateException("Bindings already cleared.");
        }
        this.target = null;
        sleep2Activity.mSlidingTabLayout = null;
        sleep2Activity.ivCalendar = null;
        sleep2Activity.tvCalendar = null;
        sleep2Activity.tvBackToday = null;
        sleep2Activity.llCalendar = null;
        sleep2Activity.mViewPager = null;
        sleep2Activity.tvDataFirst = null;
        sleep2Activity.tvDataFirstUnit = null;
        sleep2Activity.rlDataFirst = null;
        sleep2Activity.tvDataSecond = null;
        sleep2Activity.ivDataSecond = null;
        sleep2Activity.tvDataSecondUnit = null;
        sleep2Activity.llDataSecond = null;
        sleep2Activity.tvDataThirdly = null;
        sleep2Activity.ivDataThirdly = null;
        sleep2Activity.tvDataThirdlyUnit = null;
        sleep2Activity.llDataThirdly = null;
        sleep2Activity.tvStartButton = null;
        sleep2Activity.llStartButton = null;
        sleep2Activity.tvAnalyse = null;
        sleep2Activity.tvAnalyseData = null;
        sleep2Activity.rlAnalyse = null;
        sleep2Activity.ivFirstLeft = null;
        sleep2Activity.tvFirst = null;
        sleep2Activity.ivFirstRight = null;
        sleep2Activity.rlFirst = null;
        sleep2Activity.ivSecondLeft = null;
        sleep2Activity.tvSecond = null;
        sleep2Activity.ivSecondRight = null;
        sleep2Activity.rlSecond = null;
        sleep2Activity.ivFourthlyLeft = null;
        sleep2Activity.tvFourthly = null;
        sleep2Activity.ivFourthlyRight = null;
        sleep2Activity.rlFourthly = null;
        sleep2Activity.mRecyclerView = null;
        sleep2Activity.mNestedScrollView = null;
        sleep2Activity.tvYears = null;
        sleep2Activity.mCalendarView = null;
        sleep2Activity.llMonth = null;
        sleep2Activity.llRem = null;
        sleep2Activity.tvRem = null;
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
