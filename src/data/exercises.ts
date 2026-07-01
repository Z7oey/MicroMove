export type ExerciseCategory = "肩颈" | "上背" | "胸肩" | "腰背";
export type ExerciseSpace = "小空间" | "中空间" | "大空间";
export type ExerciseIntensity = "温和" | "中等";
export type ExercisePosture = "坐姿" | "站姿" | "坐姿/站姿";
export type ExerciseVisibility = "低" | "中";

export type Exercise = {
  id: string;
  category: ExerciseCategory;
  name: string;
  targetMuscles: string;
  instructions: string[];
  safetyTips: string[];
  duration: number;
  posture: ExercisePosture;
  space: ExerciseSpace;
  intensity: ExerciseIntensity;
  visibility: ExerciseVisibility;
  demoPageImage: string;
  coverImage: string;
};

export const exerciseCategories: ExerciseCategory[] = ["肩颈", "上背", "胸肩", "腰背"];

export const exercises: Exercise[] = [
  {
    id: "neck_side_tilt_left",
    category: "肩颈",
    name: "左侧颈部侧弯",
    targetMuscles: "上斜方肌",
    instructions: [
      "身体坐直或站直，肩膀自然下沉。",
      "头慢慢向右侧倾斜，让右耳靠近右肩。",
      "感到左侧颈部轻微拉伸后停住，结束后换另一侧。"
    ],
    safetyTips: [
      "不要压头猛拉。",
      "有轻微拉伸感即可。",
      "如果出现疼痛、麻木或头晕，请立即停止。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/肩颈/左侧颈部侧弯.png",
    coverImage: "/exercise-covers/左侧颈部侧弯.png"
  },
  {
    id: "neck_side_tilt_right",
    category: "肩颈",
    name: "右侧颈部侧弯",
    targetMuscles: "上斜方肌",
    instructions: [
      "身体坐直或站直，肩膀自然下沉。",
      "头慢慢向左侧倾斜，让左耳靠近左肩。",
      "感到右侧颈部轻微拉伸后停住，结束后换另一侧。"
    ],
    safetyTips: [
      "不要压头猛拉。",
      "有轻微拉伸感即可。",
      "如果出现疼痛、麻木或头晕，请立即停止。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/肩颈/右侧颈部侧弯.png",
    coverImage: "/exercise-covers/右侧颈部侧弯.png"
  },
  {
    id: "neck_forward_release",
    category: "肩颈",
    name: "低头后颈放松",
    targetMuscles: "颈后伸肌群 / 枕下肌群",
    instructions: [
      "坐直，肩膀自然下沉。",
      "慢慢把下巴靠近胸口，感受后颈被轻轻拉开。",
      "保持呼吸，再慢慢回正。"
    ],
    safetyTips: [
      "不要用手把头往下压。",
      "有颈椎问题者请谨慎。",
      "如出现不适，请立即停止。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/肩颈/低头后颈放松.png",
    coverImage: "/exercise-covers/低头后颈放松.png"
  },
  {
    id: "neck_backward_release",
    category: "肩颈",
    name: "抬头前颈放松",
    targetMuscles: "胸锁乳突肌 / 斜角肌",
    instructions: [
      "双手合十，拇指轻放在下颌处。",
      "轻轻向上、向后引导头部，感受前颈被拉开。",
      "保持 5–10 秒，均匀呼吸，再慢慢回正。"
    ],
    safetyTips: [
      "不要猛仰头，不要过度用力。",
      "如果出现头晕、刺痛或前颈不适，请立即停止。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/肩颈/抬头前颈放松.png",
    coverImage: "/exercise-covers/抬头前颈放松.png"
  },
  {
    id: "upper_back_forward_push",
    category: "上背",
    name: "双手前推上背伸展",
    targetMuscles: "菱形肌 / 肩胛骨之间",
    instructions: [
      "坐直，双手在胸前交叉或手指相扣。",
      "手臂向前推出，同时轻轻拱起上背。",
      "感受肩胛骨之间和上背被拉开，保持均匀呼吸。"
    ],
    safetyTips: [
      "不要低头过度，颈部保持放松。",
      "背部不适时减小拱背幅度。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/上背/双手前推上背伸展.png",
    coverImage: "/exercise-covers/双手前推上背伸展.png"
  },
  {
    id: "upper_back_hug",
    category: "上背",
    name: "抱背上背拉伸",
    targetMuscles: "菱形肌 / 上背肌群",
    instructions: [
      "坐直，一侧手臂从对侧腋下穿过，去抱后背。",
      "另一只手自然辅助固定，感受上背和肩胛周围被拉开。",
      "保持均匀呼吸，结束后换边。"
    ],
    safetyTips: [
      "不要勉强去抱太深。",
      "肩痛时减小幅度。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/上背/抱背上背拉伸.png",
    coverImage: "/exercise-covers/抱背上背拉伸.png"
  },
  {
    id: "shoulder_posterior_stretch_left",
    category: "上背",
    name: "肩后侧拉伸（左）",
    targetMuscles: "左侧三角肌后束 / 肩后侧肌群",
    instructions: [
      "将左臂横过胸前，右手扶住左上臂。",
      "轻轻把左臂带向身体右侧，感受左肩后侧被拉开。",
      "保持呼吸，结束后换边。"
    ],
    safetyTips: [
      "不要耸肩或硬压肩关节。",
      "肩部疼痛时请减小力度。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/上背/肩后侧拉伸（左）.png",
    coverImage: "/exercise-covers/肩后侧拉伸（左）.png"
  },
  {
    id: "shoulder_posterior_stretch_right",
    category: "上背",
    name: "肩后侧拉伸（右）",
    targetMuscles: "右侧三角肌后束 / 肩后侧肌群",
    instructions: [
      "将右臂横过胸前，左手扶住右上臂。",
      "轻轻把右臂带向身体左侧，感受右肩后侧被拉开。",
      "保持呼吸，结束后换边。"
    ],
    safetyTips: [
      "不要耸肩或硬压肩关节。",
      "肩部疼痛时请减小力度。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/上背/肩后侧拉伸（右）.png",
    coverImage: "/exercise-covers/肩后侧拉伸（右）.png"
  },
  {
    id: "chest_hands_behind_head",
    category: "胸肩",
    name: "双手脑后开肩",
    targetMuscles: "上背肌群 / 肩胛骨周围",
    instructions: [
      "坐直，双手放在脑后或颈后。",
      "手肘轻轻向外打开，肩胛骨向后靠近一点。",
      "吸气，感受胸口和上背展开。"
    ],
    safetyTips: [
      "不要用手拉脖子。",
      "重点是打开胸背，不是仰头。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/胸肩/双手脑后开肩.png",
    coverImage: "/exercise-covers/双手脑后开肩.png"
  },
  {
    id: "chest_interlaced_overhead_reach",
    category: "胸肩",
    name: "双手交扣上举拉伸",
    targetMuscles: "背阔肌 / 竖脊肌",
    instructions: [
      "双手手指交扣，向上伸直。",
      "向上延展脊柱和躯干，感受肩背和腰背被拉长。",
      "保持呼吸，放松肩膀，不要耸肩。"
    ],
    safetyTips: [
      "腰背不适时减少拉伸幅度。",
      "不要耸肩或憋气。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/胸肩/双手相扣上举拉伸.png",
    coverImage: "/exercise-covers/双手交扣上举拉伸.png"
  },
  {
    id: "chest_overhead_reach",
    category: "胸肩",
    name: "双手上举伸展",
    targetMuscles: "背阔肌 / 竖脊肌",
    instructions: [
      "双手自然向上举起，手臂向天花板方向延伸。",
      "向上延展脊柱和躯干，感受肩背和腰背被拉长。",
      "保持均匀呼吸。"
    ],
    safetyTips: [
      "腰背不适时减少拉伸幅度。",
      "不要耸肩，不要憋气。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/胸肩/双手上举伸展动作.png",
    coverImage: "/exercise-covers/双手上举伸展.png"
  },
  {
    id: "chest_hands_behind_open",
    category: "胸肩",
    name: "双手背后交叉开胸",
    targetMuscles: "胸大肌 / 肩前侧肌群",
    instructions: [
      "坐直或站直，双手在背后交叉或相扣。",
      "手臂轻轻向后伸，胸口向前打开，感觉肩胛骨轻轻往中间靠拢。",
      "保持均匀呼吸。"
    ],
    safetyTips: [
      "不要强行拉手臂。",
      "重点是打开胸口和前胸，不是把腰往前顶。",
      "肩痛时减小幅度。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/胸肩/双手背后交叉开胸.png",
    coverImage: "/exercise-covers/双手背后交叉开胸.png"
  },
  {
    id: "lower_back_overhead_side_bend_left",
    category: "腰背",
    name: "双手交扣上举侧弯（左）",
    targetMuscles: "左侧腰背 / 背阔肌",
    instructions: [
      "双手交扣举过头顶，先向上延展。",
      "再缓慢向右侧弯。",
      "感受左侧腰背被拉开，保持自然呼吸。"
    ],
    safetyTips: [
      "先向上延展，再轻轻侧弯。",
      "不要塌腰，保持自然呼吸。",
      "只做到舒服的位置。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/腰背/双手交扣上举侧弯（左）.png",
    coverImage: "/exercise-covers/双手交扣上举侧弯（左）.png"
  },
  {
    id: "lower_back_overhead_side_bend_right",
    category: "腰背",
    name: "双手交扣上举侧弯（右）",
    targetMuscles: "右侧腰背 / 背阔肌",
    instructions: [
      "双手交扣举过头顶，先向上延展。",
      "再缓慢向左侧弯。",
      "感受右侧腰背被拉开，保持自然呼吸。"
    ],
    safetyTips: [
      "先向上延展，再轻轻侧弯。",
      "不要塌腰，保持自然呼吸。",
      "只做到舒服的位置。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/腰背/双手交扣上举侧弯（右）.png",
    coverImage: "/exercise-covers/双手交扣上举侧弯（右）.png"
  },
  {
    id: "lower_back_rotation_side_bend_left",
    category: "腰背",
    name: "上举旋转侧弯（左）",
    targetMuscles: "左侧腰背 / 背阔肌 / 竖脊肌",
    instructions: [
      "双手举过头顶，先把身体向上拉长。",
      "头和上身轻轻向右转一点，再顺着方向小幅侧弯。",
      "感受左侧方后背被拉开，保持均匀呼吸。"
    ],
    safetyTips: [
      "先向上伸长，再小幅度转身和侧弯。",
      "只做到舒服的位置。",
      "保持自然呼吸。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/腰背/上举旋转侧弯（左）.png",
    coverImage: "/exercise-covers/上举旋转侧弯（左）.png"
  },
  {
    id: "lower_back_rotation_side_bend_right",
    category: "腰背",
    name: "上举旋转侧弯（右）",
    targetMuscles: "右侧腰背 / 背阔肌 / 竖脊肌",
    instructions: [
      "双手举过头顶，先把身体向上拉长。",
      "头和上身轻轻向左转一点，再顺着方向小幅侧弯。",
      "感受右侧方后背被拉开，保持均匀呼吸。"
    ],
    safetyTips: [
      "先向上伸长，再小幅度转身和侧弯。",
      "只做到舒服的位置。",
      "保持自然呼吸。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/腰背/上举旋转侧弯（右）.png",
    coverImage: "/exercise-covers/上举旋转侧弯（右）.png"
  },
  {
    id: "lower_back_seated_forward_bend",
    category: "腰背",
    name: "坐式上身弯曲",
    targetMuscles: "竖脊肌 / 腰背筋膜区",
    instructions: [
      "坐在椅子前侧，双脚踩稳。",
      "低头含胸，双手抱住小腿或放在膝前，让上背和腰背慢慢弯曲放松。",
      "保持 15–30 秒，均匀呼吸。"
    ],
    safetyTips: [
      "不要猛压身体。",
      "如果腰痛明显、腿麻或头晕，立即停止。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/腰背/坐式上身弯曲.png",
    coverImage: "/exercise-covers/坐式上身弯曲.png"
  }
];
