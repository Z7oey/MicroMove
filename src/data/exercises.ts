export type ExerciseCategory = "肩颈" | "背部与腰部";
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

export const exerciseCategories: ExerciseCategory[] = ["肩颈", "背部与腰部"];

export const exercises: Exercise[] = [
  {
    id: "neck_chin_tuck",
    category: "肩颈",
    name: "下巴内收",
    targetMuscles: "颈后深层伸肌群 / 枕下肌群",
    instructions: [
      "坐直或站直，肩膀放松。",
      "下巴不要低头，而是水平向后平移头部，像做出一点“双下巴”的感觉。",
      "保持后颈被拉长，慢慢呼吸。保持 5–10 秒，期间正常呼吸，不要憋气。放松回到原位。每组做 3 次。"
    ],
    safetyTips: [
      "不要用力顶脖子。",
      "如果头晕、刺痛或颈部疼痛，停止。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/下巴内收.png",
    coverImage: "/exercise-covers/下巴内收.png"
  },
  {
    id: "neck_side_tilt_left",
    category: "肩颈",
    name: "左侧颈部侧弯",
    targetMuscles: "上斜方肌",
    instructions: [
      "身体坐直，头慢慢向右侧倾斜。",
      "让右耳靠近右肩，肩膀保持放松，不要耸肩。",
      "感到左侧颈部轻微拉伸后保持，结束后换另一侧。"
    ],
    safetyTips: [
      "不要压头猛拉。",
      "只到轻微拉伸感。",
      "如果出现疼痛、麻木或头晕，请立即停止。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/左侧颈部侧弯.png",
    coverImage: "/exercise-covers/左侧颈部侧弯.png"
  },
  {
    id: "neck_side_tilt_right",
    category: "肩颈",
    name: "右侧颈部侧弯",
    targetMuscles: "上斜方肌",
    instructions: [
      "身体坐直，头慢慢向左侧倾斜。",
      "让左耳靠近左肩，肩膀保持放松，不要耸肩。",
      "感到右侧颈部轻微拉伸后保持，结束后换另一侧。"
    ],
    safetyTips: [
      "不要压头猛拉。",
      "只到轻微拉伸感。",
      "如果出现疼痛、麻木或头晕，请立即停止。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/右侧颈部侧弯.png",
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
    demoPageImage: "/exercise-demo-pages/低头后颈放松.png",
    coverImage: "/exercise-covers/低头后颈放松.png"
  },
  {
    id: "neck_backward_release",
    category: "肩颈",
    name: "抬头前颈放松",
    targetMuscles: "胸锁乳突肌 / 斜角肌",
    instructions: [
      "双手合十，拇指置于下颌处。",
      "手臂整体均匀发力，轻轻向上、向后引导头部，感受前颈被拉开。",
      "保持 5–10 秒，均匀呼吸，再慢慢回正。"
    ],
    safetyTips: [
      "不要猛仰头。",
      "不要过度用力。",
      "如果出现头晕、刺痛或前颈不适，请立即停止。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/抬头前颈放松.png",
    coverImage: "/exercise-covers/抬头前颈放松.png"
  },
  {
    id: "shoulder_posterior_stretch_left",
    category: "背部与腰部",
    name: "肩后侧拉伸（左）",
    targetMuscles: "左侧三角肌后束 / 肩后侧肌群",
    instructions: [
      "将左臂横过胸前，右手扶住左上臂。",
      "轻轻把左臂带向身体右侧，感受左肩后侧和上背被拉开。",
      "保持呼吸，结束后换边。"
    ],
    safetyTips: [
      "不要耸肩。",
      "肩痛时降低力度。",
      "不要硬压肩关节。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/肩后侧拉伸（左）.png",
    coverImage: "/exercise-covers/肩后侧拉伸（左）.png"
  },
  {
    id: "shoulder_posterior_stretch_right",
    category: "背部与腰部",
    name: "肩后侧拉伸（右）",
    targetMuscles: "右侧三角肌后束 / 肩后侧肌群",
    instructions: [
      "将右臂横过胸前，左手扶住右上臂。",
      "轻轻把右臂带向身体左侧，感受右肩后侧和上背被拉开。",
      "保持呼吸，结束后换边。"
    ],
    safetyTips: [
      "不要耸肩。",
      "肩痛时降低力度。",
      "不要硬压肩关节。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "低",
    demoPageImage: "/exercise-demo-pages/肩后侧拉伸（右）.png",
    coverImage: "/exercise-covers/肩后侧拉伸（右）.png"
  },
  {
    id: "back_overhead_reach",
    category: "背部与腰部",
    name: "双手相扣上举拉伸",
    targetMuscles: "背阔肌、肩部、躯干侧链",
    instructions: [
      "双手手指交扣，向上伸直。",
      "身体慢慢向上延展，感受肩背和腰背被打开。",
      "保持呼吸，放松肩膀，不要耸肩。"
    ],
    safetyTips: [
      "腰部不舒服时减小拉伸幅度。",
      "不要憋气。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/双手相扣上举拉伸.png",
    coverImage: "/exercise-covers/双手相扣上举拉伸.png"
  },
  {
    id: "back_overhead_side_bend",
    category: "背部与腰部",
    name: "双手相扣上举侧弯",
    targetMuscles: "背阔肌、前锯肌、腹外斜肌、躯干侧链",
    instructions: [
      "双手交扣举过头顶，先向上延展。",
      "再缓慢向左侧弯；回正后再向右侧弯。",
      "左右各 15 秒，共 30 秒。"
    ],
    safetyTips: [
      "不要塌腰或憋气。",
      "腰部不适时减小侧弯幅度。",
      "动作以轻微牵拉感为宜。"
    ],
    duration: 30,
    posture: "坐姿/站姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/双手相扣上举侧弯.png",
    coverImage: "/exercise-covers/双手相扣上举侧弯.png"
  },
  {
    id: "back_hands_behind_head_open_chest",
    category: "背部与腰部",
    name: "双手脑后开肩",
    targetMuscles: "胸大肌、胸小肌、三角肌前束 / 上背肌群",
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
    demoPageImage: "/exercise-demo-pages/双手脑后开肩.png",
    coverImage: "/exercise-covers/双手脑后开肩.png"
  },
  {
    id: "back_seated_forward_bend",
    category: "背部与腰部",
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
    posture: "坐姿",
    space: "小空间",
    intensity: "温和",
    visibility: "中",
    demoPageImage: "/exercise-demo-pages/坐式上身弯曲.png",
    coverImage: "/exercise-covers/坐式上身弯曲.png"
  }
];
