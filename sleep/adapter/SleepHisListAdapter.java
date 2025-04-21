package com.yucheng.smarthealthpro.home.activity.sleep.adapter;

import android.view.View;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.viewholder.BaseViewHolder;
import com.google.firebase.crashlytics.buildtools.reloc.org.apache.commons.cli.HelpFormatter;
import com.yucheng.smarthealthpro.customchart.utils.SleepUtil;
import com.yucheng.smarthealthpro.home.activity.sleep.bean.SleepHisListBean;
import com.yucheng.smarthealthpro.utils.FormatUtil;
import com.yucheng.smarthealthpro.utils.TimeStampUtils;
import com.zhuoting.healthyucheng.R;

/* loaded from: classes3.dex */
public class SleepHisListAdapter extends BaseQuickAdapter<SleepHisListBean, BaseViewHolder> {
    private OnItemClickListener mOnItemClickListener;

    public interface OnItemClickListener {
        void onClick(SleepHisListBean sleepHisListBean, int i2);

        void onDelClick(SleepHisListBean sleepHisListBean, int i2);

        void onLongClick(SleepHisListBean sleepHisListBean, int i2);
    }

    public SleepHisListAdapter(int i2) {
        super(i2);
        this.mOnItemClickListener = null;
    }

    public void setOnItemClickListener(OnItemClickListener onItemClickListener) {
        this.mOnItemClickListener = onItemClickListener;
    }

    /* JADX INFO: Access modifiers changed from: protected */
    @Override // com.chad.library.adapter.base.BaseQuickAdapter
    public void convert(BaseViewHolder baseViewHolder, final SleepHisListBean sleepHisListBean) {
        final int layoutPosition = baseViewHolder.getLayoutPosition();
        if (sleepHisListBean != null) {
            if (sleepHisListBean.isMonthWeekDay()) {
                baseViewHolder.setText(R.id.tv_data, TimeStampUtils.dateForStringDate(TimeStampUtils.longStampForDate(sleepHisListBean.getStartTime() + 14400))).setText(R.id.tv_sleep_total_time, FormatUtil.getBigDecimal(sleepHisListBean.getTotalTime() / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_light_sleep_time, FormatUtil.getBigDecimal(sleepHisListBean.getLightSleepTotal() / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_deep_sleep_time, FormatUtil.getBigDecimal(sleepHisListBean.getDeepSleepTotal() / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_rem_time, FormatUtil.getBigDecimal(sleepHisListBean.remTimes / 3600.0f).setScale(1, 4).doubleValue() + " h");
                int state = SleepUtil.getState(sleepHisListBean.getTotalTime(), sleepHisListBean.getDeepSleepTotal());
                if (state == -1) {
                    baseViewHolder.setText(R.id.tv_state, getContext().getString(R.string.sleep_quality_none));
                } else if (state == 5) {
                    baseViewHolder.setText(R.id.tv_state, getContext().getString(R.string.sleep_quality_good)).setTextColor(R.id.tv_state, getContext().getColor(R.color.value_exceptional_low));
                } else if (state >= 3 && state < 5) {
                    baseViewHolder.setText(R.id.tv_state, getContext().getString(R.string.sleep_quality_ok)).setTextColor(R.id.tv_state, getContext().getColor(R.color.value_normal));
                } else {
                    baseViewHolder.setText(R.id.tv_state, getContext().getString(R.string.sleep_quality_poor)).setTextColor(R.id.tv_state, getContext().getColor(R.color.value_exceptional_high));
                }
            } else {
                baseViewHolder.setText(R.id.tv_data, TimeStampUtils.dateForStringToDate(TimeStampUtils.longStampForDate(sleepHisListBean.getStartTime())) + HelpFormatter.DEFAULT_OPT_PREFIX + TimeStampUtils.dateForStringToDate(TimeStampUtils.longStampForDate(sleepHisListBean.getEndTime()))).setText(R.id.tv_sleep_total_time, FormatUtil.getBigDecimal(sleepHisListBean.getTotalTime() / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_light_sleep_time, FormatUtil.getBigDecimal(sleepHisListBean.getLightSleepTotal() / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_deep_sleep_time, FormatUtil.getBigDecimal(sleepHisListBean.getDeepSleepTotal() / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_rem_time, FormatUtil.getBigDecimal(sleepHisListBean.remTimes / 3600.0f).setScale(1, 4).doubleValue() + " h").setText(R.id.tv_state, "");
            }
            baseViewHolder.itemView.setOnClickListener(new View.OnClickListener() { // from class: com.yucheng.smarthealthpro.home.activity.sleep.adapter.SleepHisListAdapter.1
                @Override // android.view.View.OnClickListener
                public void onClick(View view) {
                    if (SleepHisListAdapter.this.mOnItemClickListener != null) {
                        SleepHisListAdapter.this.mOnItemClickListener.onClick(sleepHisListBean, layoutPosition);
                    }
                }
            });
        }
    }
}
