export interface InstagramData {
  handle: string
  followers: string
  following: string
  post_count: string
  estimated_engagement_rate: string
  posting_frequency: string
  content_themes: string[]
  formats_used: string[]
  what_is_working: string
  what_is_missing: string
  best_performing_content_type: string
  profile_completeness_score: number
  bio_assessment: string
  link_in_bio_status: string
  reels_strategy: string
  stories_frequency: string
  growth_trend: 'growing' | 'stagnant' | 'declining' | 'unknown'
}

export interface TikTokData {
  handle: string
  followers: string
  total_likes: string
  video_count: string
  estimated_avg_views: string
  estimated_top_video_views: string
  formats_used: string[]
  posting_frequency: string
  profile_score: number
  viral_potential: 'low' | 'medium' | 'high'
  duet_stitch_usage: string
  trending_sounds_used: boolean
  what_is_working: string
  what_is_missing: string
  growth_trend: 'growing' | 'stagnant' | 'declining' | 'unknown'
}

export interface CompetitorSocialData {
  name: string
  instagram_handle: string
  tiktok_handle: string
  instagram_followers: string
  tiktok_followers: string
  estimated_monthly_reach: string
  posting_frequency: string
  top_content_formats: string[]
  content_themes_that_perform: string[]
  estimated_avg_engagement_rate: string
  what_they_do_better: string[]
  their_content_gaps: string[]
  their_tone: string
  halal_messaging: boolean
  community_engagement: string
  threat_level: 'low' | 'medium' | 'high'
  key_strategic_insight: string
  opportunity_to_steal_audience: string
}

export interface TrendingFormat {
  format_name: string
  description: string
  why_algorithm_loves_it: string
  real_world_example: string
  how_to_apply_to_restaurant: string
  difficulty: 'easy' | 'moderate' | 'hard'
  estimated_reach_potential: string
}

export interface ViralIntelligenceData {
  trending_formats_right_now: TrendingFormat[]
  trending_sounds_to_use: string[]
  trending_hashtags: {
    mega_tags: string[]
    macro_tags: string[]
    niche_halal_tags: string[]
    location_tags: string[]
    recommended_mix: string
  }
  best_posting_times: {
    instagram_weekday: string
    instagram_weekend: string
    tiktok_weekday: string
    tiktok_weekend: string
    ramadan_special: string
  }
  algorithm_insights: string[]
  content_gap_in_market: string
}

export interface SentimentData {
  instagram_sentiment: 'very positive' | 'positive' | 'mixed' | 'negative' | 'unknown'
  tiktok_sentiment: 'very positive' | 'positive' | 'mixed' | 'negative' | 'unknown'
  positive_themes: string[]
  negative_themes: string[]
  customer_language_patterns: string[]
  viral_trigger_phrases: string[]
  brand_perception: string
  community_feeling: string
  sentiment_opportunity: string
}

export interface ContentCalendarItem {
  week: number
  day: string
  platform: 'Instagram' | 'TikTok' | 'Both'
  content_type: string
  format: string
  hook: string
  concept: string
  what_to_film: string
  caption_starter: string
  hashtags: string[]
  best_time_to_post: string
  viral_potential: 'low' | 'medium' | 'high'
  effort_level: 'easy' | 'moderate' | 'hard'
  trending_element_used: string
  why_this_will_perform: string
  call_to_action: string
}

export interface ContentIdeaData {
  title: string
  platform: string
  format: string
  hook_line: string
  full_concept: string
  what_to_film_step_by_step: string[]
  production_requirements: string
  estimated_reach_potential: string
  best_posting_time: string
  caption_template: string
  hashtag_set: string[]
  call_to_action: string
  trending_element: string
  why_this_will_go_viral: string
}

export interface QuickWinData {
  action: string
  platform: string
  specific_steps: string[]
  effort: 'easy' | 'moderate' | 'hard'
  estimated_impact: string
  do_today: boolean
  zero_cost: boolean
}

export interface GrowthRoadmapData {
  current_estimated_reach: string
  days_30: { goal: string; key_actions: string[]; follower_target: string }
  days_60: { goal: string; key_actions: string[]; follower_target: string }
  days_90: { goal: string; key_actions: string[]; follower_target: string }
  success_metrics: string[]
}

export interface ViralOpportunityData {
  headline: string
  opportunity_description: string
  why_right_now: string
  exact_steps: string[]
  estimated_reach_if_executed: string
  time_sensitive: boolean
}

export interface GrandOpeningPackData {
  include: boolean
  pre_launch_7_days: Array<{
    day: string
    platform: string
    content_type: string
    concept: string
    hook: string
    caption: string
    goal: string
  }>
  opening_day_sequence: Array<{
    time: string
    platform: string
    content: string
    goal: string
  }>
  free_food_promo_announcement_script: string
  queue_video_strategy: string
  post_launch_week_1: string[]
}

export interface SeasonalCampaignData {
  type: 'ramadan' | 'eid' | 'none'
  campaign_overview: string
  content_plan: Array<{
    phase: string
    content_ideas: string[]
    best_formats: string[]
    key_message: string
    posting_schedule: string
  }>
  ramadan_specific_hooks: string[]
  eid_specific_hooks: string[]
  community_engagement_ideas: string[]
}

export interface SocialAnalysisResult {
  restaurant_name: string
  city: string
  concept: string
  analysis_date: string
  overall_social_score: number
  social_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  data_sources_searched: string[]
  own_presence: {
    instagram: InstagramData
    tiktok: TikTokData
    combined_monthly_reach_estimate: string
    social_vs_competitor_gap: string
  }
  competitor_analysis: CompetitorSocialData[]
  viral_content_intelligence: ViralIntelligenceData
  sentiment_analysis: SentimentData
  content_calendar: ContentCalendarItem[]
  content_ideas_deep_dive: ContentIdeaData[]
  quick_wins: QuickWinData[]
  growth_roadmap: GrowthRoadmapData
  viral_opportunity: ViralOpportunityData
  grand_opening_pack: GrandOpeningPackData
  seasonal_campaign: SeasonalCampaignData
  summary: string
}

export interface HookGeneratorResult {
  topic: string
  tiktok_hooks: Array<{
    hook: string
    trigger_type: string
    why_it_works: string
    example_continuation: string
  }>
  instagram_hooks: Array<{
    hook: string
    trigger_type: string
    why_it_works: string
    caption_continuation: string
  }>
  bonus_cta_options: string[]
}

export interface HashtagResult {
  topic: string
  hashtag_sets: {
    mega: Array<{ tag: string; estimated_posts: string; reach: string; competition: string }>
    macro: Array<{ tag: string; estimated_posts: string; reach: string; competition: string }>
    micro: Array<{ tag: string; estimated_posts: string; reach: string; competition: string }>
    niche: Array<{ tag: string; estimated_posts: string; reach: string; competition: string }>
    location: Array<{ tag: string; estimated_posts: string; reach: string; competition: string }>
  }
  recommended_mix: {
    instagram_set_small: string[]
    instagram_set_large: string[]
    tiktok_set: string[]
    strategy_note: string
  }
  trending_right_now: string[]
  avoid_these: string[]
  copy_ready_blocks: {
    instagram_small: string
    instagram_large: string
    tiktok: string
  }
}
