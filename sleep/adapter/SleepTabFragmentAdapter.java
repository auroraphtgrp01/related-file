package com.yucheng.smarthealthpro.home.activity.sleep.adapter;

import android.util.SparseArray;
import android.view.ViewGroup;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentStatePagerAdapter;
import java.util.ArrayList;
import java.util.List;

/* loaded from: classes3.dex */
public class SleepTabFragmentAdapter extends FragmentStatePagerAdapter {
    private FragmentCreator mCreator;
    private List<String> mTitles;
    private SparseArray<Fragment> registeredFragments;

    public interface FragmentCreator {
        Fragment createFragment(String str, int i2);

        String createTitle(String str);
    }

    public SleepTabFragmentAdapter(FragmentManager fragmentManager, FragmentCreator fragmentCreator) {
        super(fragmentManager);
        this.registeredFragments = new SparseArray<>();
        this.mTitles = new ArrayList();
        this.mCreator = fragmentCreator;
    }

    @Override // androidx.fragment.app.FragmentStatePagerAdapter
    public Fragment getItem(int i2) {
        return this.mCreator.createFragment(this.mTitles.get(i2), i2);
    }

    @Override // androidx.fragment.app.FragmentStatePagerAdapter, androidx.viewpager.widget.PagerAdapter
    public Object instantiateItem(ViewGroup viewGroup, int i2) {
        Fragment fragment = (Fragment) super.instantiateItem(viewGroup, i2);
        this.registeredFragments.put(i2, fragment);
        return fragment;
    }

    public Fragment getFragment(int i2) {
        return this.registeredFragments.get(i2);
    }

    @Override // androidx.viewpager.widget.PagerAdapter
    public int getCount() {
        List<String> list = this.mTitles;
        if (list == null) {
            return 0;
        }
        return list.size();
    }

    public void setData(List<String> list) {
        this.mTitles = list;
        notifyDataSetChanged();
    }

    @Override // androidx.viewpager.widget.PagerAdapter
    public CharSequence getPageTitle(int i2) {
        return this.mCreator.createTitle(this.mTitles.get(i2));
    }
}
