import { getDb, mutateDb, loadDatabase } from './db.js';

export function seedDb() {
  loadDatabase();
  const currentDb = getDb();

  if (currentDb.settings && currentDb.settings.length > 0) {
    console.log('Database already initialized. Preserving existing data.');
    return;
  }

  console.log('🌱 Seeding database with Editor OS v2.0 complete architecture...');

  const today = new Date();
  const cycleStart = new Date(today.getTime() - 17 * 24 * 60 * 60 * 1000); // Day 18 today
  const cycleStartStr = cycleStart.toISOString().split('T')[0];
  const todayStr = today.toISOString().split('T')[0];

  const deadlineProj1 = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const startProj1 = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  mutateDb((db) => {
    // 1. Settings
    db.settings = [
      {
        id: 1,
        cycle_start_date: cycleStartStr,
        cycle_duration_days: 90,
        user_name: 'Alex (Video Editor)',
        created_at: new Date().toISOString()
      }
    ];

    // 2. Categories
    db.categories = [
      {
        id: 'cat_video_editing',
        name: 'Video Editing',
        icon: 'Clapperboard',
        status: 'In Progress',
        parent_id: null,
        order_index: 1,
        next_action: 'Refine commercial editing portfolio with 4K assets',
        created_at: new Date().toISOString()
      },
      {
        id: 'cat_marketing',
        name: 'Marketing',
        icon: 'Megaphone',
        status: 'In Progress',
        parent_id: null,
        order_index: 2,
        next_action: 'Prepare the first Before/After Reel for Instagram',
        created_at: new Date().toISOString()
      },
      {
        id: 'cat_freelance',
        name: 'Freelance / Clients',
        icon: 'Briefcase',
        status: 'In Progress',
        parent_id: null,
        order_index: 3,
        next_action: 'Reach out to 3 local sports brands with video audit',
        created_at: new Date().toISOString()
      },
      {
        id: 'cat_skills',
        name: 'Skills / Learning',
        icon: 'GraduationCap',
        status: 'In Progress',
        parent_id: null,
        order_index: 4,
        next_action: 'Master 3D Camera Tracking in After Effects',
        created_at: new Date().toISOString()
      },

      // Video Editing Subcategories
      {
        id: 'sub_portfolio',
        name: 'Portfolio',
        icon: 'Folder',
        status: 'In Progress',
        parent_id: 'cat_video_editing',
        order_index: 1,
        next_action: 'Finalize Sports Drink Commercial sound mix',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_premiere',
        name: 'Premiere Pro',
        icon: 'Video',
        status: 'In Progress',
        parent_id: 'cat_video_editing',
        order_index: 2,
        next_action: 'Create automated rough cut shortcut macro',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_ae',
        name: 'After Effects',
        icon: 'Layers',
        status: 'In Progress',
        parent_id: 'cat_video_editing',
        order_index: 3,
        next_action: 'Practice kinetic typography transitions',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_mograph',
        name: 'Motion Graphics',
        icon: 'Sparkles',
        status: 'In Progress',
        parent_id: 'cat_video_editing',
        order_index: 4,
        next_action: 'Build custom lower thirds pack',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_color',
        name: 'Color Grading',
        icon: 'Palette',
        status: 'In Progress',
        parent_id: 'cat_video_editing',
        order_index: 5,
        next_action: 'Study DaVinci Resolve color space transforms',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_sound',
        name: 'Sound Design',
        icon: 'Volume2',
        status: 'In Progress',
        parent_id: 'cat_video_editing',
        order_index: 6,
        next_action: 'Organize SFX library by whoosh, risers, and hits',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_ai_video',
        name: 'AI Video',
        icon: 'Cpu',
        status: 'Planning',
        parent_id: 'cat_video_editing',
        order_index: 7,
        next_action: 'Test Runway Gen-3 camera controls',
        created_at: new Date().toISOString()
      },

      // Marketing Subcategories
      {
        id: 'sub_insta',
        name: 'Instagram',
        icon: 'Instagram',
        status: 'In Progress',
        parent_id: 'cat_marketing',
        order_index: 1,
        next_action: 'Prepare first Before/After Reel',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_tiktok',
        name: 'TikTok',
        icon: 'Music2',
        status: 'In Progress',
        parent_id: 'cat_marketing',
        order_index: 2,
        next_action: 'Publish 3 short viral editing breakdowns',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_behance',
        name: 'Behance',
        icon: 'Globe',
        status: 'Planning',
        parent_id: 'cat_marketing',
        order_index: 3,
        next_action: 'Create case study layout for Nike style spec ad',
        created_at: new Date().toISOString()
      },
      {
        id: 'sub_fiverr',
        name: 'Fiverr',
        icon: 'DollarSign',
        status: 'In Progress',
        parent_id: 'cat_marketing',
        order_index: 4,
        next_action: 'Optimize Gig #1 tags and video preview',
        created_at: new Date().toISOString()
      }
    ];

    // 3. Category Tasks
    db.tasks = [
      {
        id: 't_insta_1',
        title: 'Create account & set handle',
        category_id: 'sub_insta',
        completed: true,
        completed_at: new Date().toISOString(),
        order_index: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_2',
        title: 'Choose profile picture & brand theme',
        category_id: 'sub_insta',
        completed: true,
        completed_at: new Date().toISOString(),
        order_index: 2,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_3',
        title: 'Craft high-converting bio',
        category_id: 'sub_insta',
        completed: true,
        completed_at: new Date().toISOString(),
        order_index: 3,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_4',
        title: 'Link portfolio showreel',
        category_id: 'sub_insta',
        completed: true,
        completed_at: new Date().toISOString(),
        order_index: 4,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_5',
        title: 'Define 30-day content strategy',
        category_id: 'sub_insta',
        completed: true,
        completed_at: new Date().toISOString(),
        order_index: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_6',
        title: 'Prepare first content batch (5 Reels)',
        category_id: 'sub_insta',
        completed: false,
        order_index: 6,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_7',
        title: 'Publish first 3 posts',
        category_id: 'sub_insta',
        completed: false,
        order_index: 7,
        created_at: new Date().toISOString()
      },
      {
        id: 't_insta_8',
        title: 'Review results & optimize hook duration',
        category_id: 'sub_insta',
        completed: false,
        order_index: 8,
        created_at: new Date().toISOString()
      }
    ];

    // 4. Goals
    db.goals = [
      {
        id: 'goal_1',
        title: 'Build 5 Tier-1 Commercial Portfolio Pieces',
        description: 'High production value portfolio pieces for sports, fashion, and tech brands.',
        target_date: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'In Progress',
        category_id: 'cat_video_editing',
        next_action: 'Complete Sports Drink commercial sound mix',
        notes: 'Focus on hyper-clean pacing and sound design.',
        created_at: new Date().toISOString()
      },
      {
        id: 'goal_2',
        title: 'Sign 3 Retainer Freelance Clients ($3,000/mo)',
        description: 'Establish steady monthly income through direct outreach and LinkedIn networking.',
        target_date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'In Progress',
        category_id: 'cat_freelance',
        next_action: 'Send 5 personalized video audits to creators',
        notes: 'Offer value-first free audit of their current short-form edits.',
        created_at: new Date().toISOString()
      },
      {
        id: 'goal_3',
        title: 'Grow Instagram to 1,000 Quality Followers',
        description: 'Build authority by posting breakdown reels and before/after editing clips.',
        target_date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'In Progress',
        category_id: 'cat_marketing',
        next_action: 'Post first Before/After breakdown reel',
        notes: 'Consistency over perfection.',
        created_at: new Date().toISOString()
      }
    ];

    // 5. Projects
    db.projects = [
      {
        id: 'proj_sports_drink',
        name: 'Sports Drink Commercial Spec Ad',
        type: 'Portfolio',
        category_id: 'cat_video_editing',
        status: 'In Progress',
        priority: 'High',
        health_status: 'At Risk',
        start_date: startProj1,
        deadline: deadlineProj1,
        description: 'Fast-paced, energetic spec commercial showcasing sound design, speed ramping, and dramatic color grading.',
        expected_difficulty: 'Hard',
        actual_difficulty: null,
        next_action: 'Find 5 sound design references for the water drop sequence',
        final_output_url: 'https://vimeo.com/example/sports-spec',
        lessons_learned: 'Keep audio keyframes grouped and use multi-band compression for heavy bass drops.',
        created_at: new Date().toISOString()
      }
    ];

    // Project Tasks
    const projectTasks = [
      { title: 'Research references & moodboard', stage: 'Research', completed: true },
      { title: 'Define visual concept & pacing', stage: 'Research', completed: true },
      { title: 'Collect & organize 4K stock footage', stage: 'Research', completed: true },
      { title: 'Create rough assembly cut', stage: 'Editing', completed: true },
      { title: 'Refine speed ramps and beat sync', stage: 'Editing', completed: true },
      { title: 'Detailed sound design (hits, sub-drops)', stage: 'Sound Design', completed: false, due_date: todayStr },
      { title: 'Commercial color grading & film grain', stage: 'Color Grading', completed: false, due_date: deadlineProj1 },
      { title: '3D motion graphic title reveal', stage: 'Motion Graphics', completed: false, due_date: deadlineProj1 },
      { title: 'Master export & audio loudness check', stage: 'Export', completed: false, due_date: deadlineProj1 },
      { title: 'Upload to portfolio & create breakdown', stage: 'Export', completed: false, due_date: deadlineProj1 }
    ];

    projectTasks.forEach((t, idx) => {
      db.tasks.push({
        id: `t_sp_${idx + 1}`,
        title: t.title,
        project_id: 'proj_sports_drink',
        stage: t.stage,
        due_date: t.due_date || null,
        completed: t.completed,
        completed_at: t.completed ? new Date().toISOString() : null,
        order_index: idx + 1,
        created_at: new Date().toISOString()
      });
    });

    // 6. Blockers
    db.blockers = [
      {
        id: 'blk_1',
        related_entity_type: 'project',
        related_entity_id: 'proj_sports_drink',
        description: 'Need punchy water splash & ice cube SFX assets with clear commercial license',
        active: true,
        created_at: new Date().toISOString()
      }
    ];

    // 7. Time Logs
    db.time_logs = [
      {
        id: 'tl_1',
        project_id: 'proj_sports_drink',
        stage: 'Research',
        hours: 2.0,
        date: startProj1,
        notes: 'Moodboard and reference track selection',
        created_at: new Date().toISOString()
      },
      {
        id: 'tl_2',
        project_id: 'proj_sports_drink',
        stage: 'Editing',
        hours: 6.0,
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Rough cut and beat alignment',
        created_at: new Date().toISOString()
      },
      {
        id: 'tl_3',
        project_id: 'proj_sports_drink',
        stage: 'Sound Design',
        hours: 3.0,
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Foley layering and whoosh transitions',
        created_at: new Date().toISOString()
      }
    ];

    // 8. Before & After
    db.before_after_entries = [
      {
        id: 'ba_1',
        project_id: 'proj_sports_drink',
        before_title: 'Raw Flat Log Footage & Basic Cut',
        before_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60',
        after_title: 'Graded, Speed Ramped & Sound Mixed Commercial',
        after_url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60',
        improvements_notes: '1. Applied high-contrast teal & orange grade with subtle glow on highlights.\n2. Added 14 separate SFX layers (sub-bass impacts, swishes, foley breaths).\n3. Cut 4 seconds of dead time for snappy 15-second pacing.',
        created_at: new Date().toISOString()
      }
    ];

    // 9. Content Items
    db.content_items = [
      {
        id: 'cnt_1',
        title: 'Before vs After: Raw Log vs Final Color Grade',
        platforms: ['Instagram', 'TikTok'],
        status: 'Ready',
        content_type: 'Reel / Short',
        main_idea: 'Visual comparison highlighting how color grading and sound transforms raw flat footage.',
        hook: 'You are not bad at editing, your footage is just ungraded...',
        structure: '0-2s: Flat raw clip with no audio\n2-5s: Wipe transition with massive bass drop\n5-15s: Side-by-side with DaVinci node breakdown',
        required_footage: 'Sports drink raw vs final export',
        caption: 'Color grading is 50% of the visual mood. Here is the exact transformation on our latest spec ad. #videoediting #premierepro #davinciresolve',
        hashtags: '#videoeditor #colorgrading #cinematic #filmmaking #broll',
        scheduled_date: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        project_id: 'proj_sports_drink',
        hours_invested: 2.5,
        views: 0,
        likes: 0,
        saves: 0,
        shares: 0,
        comments: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'cnt_2',
        title: '3 Sound Design Rules for High-Paced Commercials',
        platforms: ['Instagram', 'TikTok', 'Behance'],
        status: 'In Progress',
        content_type: 'Carousel / Post',
        main_idea: 'Educational breakdown of riser placement, sub-bass drops, and audio ducking.',
        hook: 'Why your commercial feels boring (and how audio fixes it)',
        structure: 'Slide 1: The silent mistake\nSlide 2: Layering 3 textures\nSlide 3: Panning for width',
        required_footage: 'Timeline screenshots with waveform highlights',
        caption: 'Stop relying on just background music. Sound design creates the perceived quality. Swipe to see the framework ➡️',
        hashtags: '#sounddesign #videoediting #editingtips',
        scheduled_date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours_invested: 1.5,
        views: 0,
        likes: 0,
        saves: 0,
        shares: 0,
        comments: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 'cnt_3',
        title: 'My 90-Day Video Editor Growth System Breakdown',
        platforms: ['Instagram', 'TikTok'],
        status: 'Posted',
        content_type: 'Reel / Short',
        main_idea: 'Behind the scenes showing the Editor OS dashboard and how I manage projects.',
        hook: 'How I organize all my client projects and editing skills in one place',
        structure: 'Screen recording walkthrough with voiceover',
        required_footage: 'Editor OS UI screen recording',
        caption: 'Staying organized is how you scale from $50 gigs to $1,000 commercials.',
        hashtags: '#productivity #videoeditor #freelancelife',
        scheduled_date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        hours_invested: 3.0,
        views: 14200,
        likes: 1120,
        saves: 890,
        shares: 240,
        comments: 48,
        created_at: new Date().toISOString()
      }
    ];

    // 10. Clients
    db.clients = [
      {
        id: 'cli_1',
        name: 'Peak Energy Labs',
        contact_method: 'Instagram DM',
        status: 'Discussion',
        contact_date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        follow_up_date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        potential_project: '3x Product Launch Reels ($1,200)',
        revenue: 1200,
        notes: 'Client loved the sound design sample. Sending contract draft on Friday.',
        created_at: new Date().toISOString()
      },
      {
        id: 'cli_2',
        name: 'Apex Fitness Apparel',
        contact_method: 'Email',
        status: 'Contacted',
        contact_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        follow_up_date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        potential_project: 'Monthly Short-Form Video Package (12 edits/mo)',
        revenue: 2000,
        notes: 'Sent personalized video teardown of their recent TikTok ads.',
        created_at: new Date().toISOString()
      }
    ];

    // 11. Development Logs & Strategy Change Log
    db.development_logs = [
      {
        id: 'log_1',
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category_id: 'cat_freelance',
        project_id: null,
        title: 'Strategy Pivot: Quality Video Audits over Cold Mass DM',
        comment: 'Pivoted outreach model from high volume cold DMs to tailored 60-second video audits analyzing creator hooks.',
        is_strategy_change: true,
        old_strategy: 'Send 15 generic cold copy-paste messages per day',
        new_strategy: 'Send 3 personalized Loom video audits with custom hook re-edits',
        change_reason: 'Generic outreach yielded 0% response rate over 2 weeks. Custom video audits generate instant credibility.',
        created_at: new Date().toISOString()
      },
      {
        id: 'log_2',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        category_id: 'cat_video_editing',
        project_id: 'proj_sports_drink',
        title: 'Completed Rough Assembly for Sports Commercial',
        comment: 'All footage matched to 140 BPM rhythm track. Pacing feels tight and impactful.',
        is_strategy_change: false,
        created_at: new Date().toISOString()
      }
    ];

    // 12. Knowledge Base & References
    db.knowledge_entries = [
      {
        id: 'kb_1',
        category: 'Sound Design',
        title: 'Multi-Layer Impact Synthesis',
        description: 'Combining high-frequency whoosh, mid-frequency mechanical click, and sub-80Hz bass drop to create immense weight.',
        when_to_use: 'Use on beat drops, logo reveals, and dramatic smash cuts.',
        notes: 'Always low-pass filter background music by 6dB during the impact hit.',
        linked_project_id: 'proj_sports_drink',
        created_at: new Date().toISOString()
      },
      {
        id: 'kb_2',
        category: 'After Effects',
        title: '3D Camera Projection Mapping',
        description: 'Projecting 2D photography onto 3D geometry to create parallax motion from still images.',
        when_to_use: 'Use when client gives low-resolution still photos and wants dynamic video movement.',
        notes: 'Use CC Power Pin and 3D null controller for realistic focal blur.',
        linked_project_id: null,
        created_at: new Date().toISOString()
      }
    ];

    db.reference_items = [
      {
        id: 'ref_1',
        title: 'Nike — "Never Done Evolving" Commercial',
        link: 'https://vimeo.com/76543210',
        category: 'Pacing & Flow',
        platform: 'Vimeo',
        why_saved: 'Masterclass in kinetic montage cutting and visual rhythm matching high-tempo electronic track.',
        what_to_learn: 'Analyze frame duration between cuts during sprint sequence (avg 8-12 frames per cut).',
        created_at: new Date().toISOString()
      },
      {
        id: 'ref_2',
        title: 'Apple — M3 Max Chip Dynamic Kinetic Reveal',
        link: 'https://youtube.com/watch?v=example_apple',
        category: 'Motion Graphics',
        platform: 'YouTube',
        why_saved: 'Seamless transition from 3D wireframe to real product with laser sound effects.',
        what_to_learn: 'Replicate the glowing edge displacement and chromatic aberration pass in After Effects.',
        created_at: new Date().toISOString()
      }
    ];

    // 13. Quick Ideas
    db.quick_ideas = [
      {
        id: 'qi_1',
        text: 'Video idea — before/after editing, raw footage → final commercial color + sound',
        captured_at: new Date().toISOString(),
        target_category: 'Content',
        triaged: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'qi_2',
        text: 'Create customized DaVinci Resolve powergrade for gym/fitness aesthetic',
        captured_at: new Date().toISOString(),
        target_category: 'Learning',
        triaged: false,
        created_at: new Date().toISOString()
      }
    ];

    // 14. Wins
    db.wins = [
      {
        id: 'win_1',
        title: 'First Commercial Spec Ad Rough Cut Completed',
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Finished first high-end commercial cut with seamless speed ramps.',
        category: 'Portfolio',
        created_at: new Date().toISOString()
      },
      {
        id: 'win_2',
        title: 'First $1,200 Project Discussion with Peak Energy',
        date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Received positive proposal response from brand marketing lead.',
        category: 'Revenue',
        created_at: new Date().toISOString()
      }
    ];

    // 15. Reports
    db.reports = [
      {
        id: 'rep_sample_week',
        type: 'weekly',
        period_start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period_end: todayStr,
        metrics_json: {
          tasks_completed: 5,
          projects_active: 1,
          reels_posted: 1,
          outreach_sent: 5,
          replies: 2,
          revenue: 1200
        },
        what_worked: 'Pacing out sound design into a dedicated session improved audio crispness immensely.',
        what_failed: 'Spent too long looking for free sound effects on random websites.',
        problems_encountered: 'Stuck on finding high quality water splash SFX assets.',
        what_learned: 'Sub-bass compression is critical to prevent audio clipping on mobile phone speakers.',
        next_priorities: 'Finalize Sports Drink commercial color grade and sound mix. Send follow up to Peak Energy.',
        biggest_win: 'Peak Energy requested formal contract discussion.',
        biggest_problem: 'Active blocker on SFX assets.',
        created_at: new Date().toISOString()
      }
    ];
  });

  console.log('✅ Default seed data written to memory & disk.');
}
