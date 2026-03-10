"use client";
import React, { useState, useCallback } from "react";
import {
  X,
  Monitor,
  Trees,
  Sparkles,
  Move,
  LayoutDashboard,
  Volume2,
  Eye,
  RotateCcw,
  ChevronDown,
  Zap,
  Sun,
  Cloud,
  Palette,
  Layers,
  Mountain,
  Swords,
  Maximize,
  Activity,
  Vibrate,
  Skull,
  Crosshair,
  Shield,
  ZoomIn,
  MousePointer,
  PanelTop,
  Heart,
  Target,
  Radio,
  Clock,
  FastForward,
  VolumeX,
  Headphones,
  Wind,
  Accessibility,
  Contrast,
  Type,
  AlertCircle,
  Lock,
  Unlock,
  Star,
} from "lucide-react";
import { OrnateFrame } from "../ui/OrnateFrame";
import { PANEL, GOLD, OVERLAY, panelGradient, dividerGradient } from "../ui/theme";
import { DEV_MODE_STORAGE_KEY } from "../../constants/settings";
import type {
  GameSettings,
  QualityPreset,
  SettingsCategory,
  ShadowQuality,
  ParticleDensity,
  FogQuality,
  GradientQuality,
  EnvironmentEffects,
  DecorationDensity,
  BattleDebrisDensity,
  DecorationScale,
  AnimationIntensity,
  CameraEdgePan,
  DamageNumberStyle,
  ColorblindMode,
  UIScale,
} from "../../constants/settings";

// =============================================================================
// REUSABLE SETTING CONTROLS
// =============================================================================

interface SegmentedControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: PANEL.bgDeep }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
            style={{
              background: active
                ? `linear-gradient(180deg, ${GOLD.accentBorder50}, ${GOLD.accentBorder35})`
                : "transparent",
              color: active ? "#1a1207" : "rgba(253,230,138,0.6)",
              border: active ? "none" : "1px solid transparent",
              fontWeight: active ? 700 : 500,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface SliderControlProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatLabel?: (value: number) => string;
}

function SliderControl({
  value,
  min,
  max,
  step,
  onChange,
  formatLabel,
}: SliderControlProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(90deg, rgba(251,191,36,0.7) 0%, rgba(251,191,36,0.7) ${pct}%, rgba(60,50,30,0.6) ${pct}%, rgba(60,50,30,0.6) 100%)`,
        }}
      />
      <span className="text-xs text-amber-300 font-mono w-12 text-right">
        {formatLabel ? formatLabel(value) : value.toFixed(1)}
      </span>
    </div>
  );
}

interface ToggleControlProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

function ToggleControl({ value, onChange }: ToggleControlProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-all"
      style={{
        background: value
          ? "linear-gradient(90deg, rgba(251,191,36,0.7), rgba(217,119,6,0.8))"
          : "rgba(60,50,30,0.6)",
        border: `1px solid ${value ? GOLD.accentBorder40 : GOLD.innerBorder10}`,
      }}
    >
      <div
        className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
        style={{
          left: value ? "calc(100% - 22px)" : "2px",
          background: value ? "#fbbf24" : "rgba(180,140,60,0.4)",
          boxShadow: value ? "0 0 6px rgba(251,191,36,0.4)" : "none",
        }}
      />
    </button>
  );
}

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  tag?: "restart" | "coming-soon";
  children: React.ReactNode;
}

function SettingRow({ icon, label, description, tag, children }: SettingRowProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3 px-4 rounded-lg transition-colors hover:bg-white/[0.02] ${tag === "coming-soon" ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="text-amber-500/70 flex-shrink-0">{icon}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-amber-200 flex items-center gap-2">
            {label}
            {tag === "restart" && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-400/80 border border-amber-700/30">Restart</span>
            )}
            {tag === "coming-soon" && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-400/80 border border-zinc-600/30">Soon</span>
            )}
          </div>
          {description && (
            <div className="text-xs text-amber-200/40 mt-0.5">{description}</div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="pt-4 pb-1 px-4">
      <div className="flex items-center gap-3">
        <div className="text-xs font-bold uppercase tracking-widest text-amber-500/50">
          {label}
        </div>
        <div className="flex-1 h-px" style={{ background: dividerGradient }} />
      </div>
    </div>
  );
}

// =============================================================================
// CATEGORY PANELS
// =============================================================================

interface CategoryPanelProps {
  settings: GameSettings;
  updateCategory: <K extends SettingsCategory>(
    category: K,
    patch: Partial<GameSettings[K]>
  ) => void;
}

function GraphicsPanel({ settings, updateCategory }: CategoryPanelProps) {
  const g = settings.graphics;
  const update = (patch: Partial<GameSettings["graphics"]>) =>
    updateCategory("graphics", patch);

  return (
    <>
      <SectionDivider label="Shadows & Lighting" />
      <SettingRow icon={<Sun size={16} />} label="Shadow Quality" description="Higher quality uses larger blur radii">
        <SegmentedControl<ShadowQuality>
          value={g.shadowQuality}
          options={[
            { value: "off", label: "Off" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Med" },
            { value: "high", label: "High" },
          ]}
          onChange={(v) => update({ shadowQuality: v })}
        />
      </SettingRow>
      <SettingRow icon={<Sun size={16} />} label="God Rays" description="Volumetric light beams">
        <ToggleControl value={g.showGodRays} onChange={(v) => update({ showGodRays: v })} />
      </SettingRow>
      <SettingRow icon={<Sparkles size={16} />} label="Screen Glow" description="Ambient glow effects">
        <ToggleControl value={g.showScreenGlow} onChange={(v) => update({ showScreenGlow: v })} />
      </SettingRow>

      <SectionDivider label="Particles & Effects" />
      <SettingRow icon={<Sparkles size={16} />} label="Particle Density" description="Number of particles spawned">
        <SegmentedControl<ParticleDensity>
          value={g.particleDensity}
          options={[
            { value: "off", label: "Off" },
            { value: "reduced", label: "Low" },
            { value: "full", label: "Full" },
            { value: "extra", label: "Extra" },
          ]}
          onChange={(v) => update({ particleDensity: v })}
        />
      </SettingRow>

      <SectionDivider label="Atmosphere" />
      <SettingRow icon={<Cloud size={16} />} label="Fog Quality" description="Fog bank complexity">
        <SegmentedControl<FogQuality>
          value={g.fogQuality}
          options={[
            { value: "off", label: "Off" },
            { value: "reduced", label: "Low" },
            { value: "full", label: "Full" },
          ]}
          onChange={(v) => update({ fogQuality: v })}
        />
      </SettingRow>
      <SettingRow icon={<Palette size={16} />} label="Gradient Quality" description="Gradient color stops">
        <SegmentedControl<GradientQuality>
          value={g.gradientQuality}
          options={[
            { value: "simplified", label: "Simple" },
            { value: "full", label: "Full" },
          ]}
          onChange={(v) => update({ gradientQuality: v })}
        />
      </SettingRow>
      <SettingRow icon={<Wind size={16} />} label="Environment Effects" description="Ambient wind, leaves, pollen">
        <SegmentedControl<EnvironmentEffects>
          value={g.environmentEffects}
          options={[
            { value: "off", label: "Off" },
            { value: "reduced", label: "Low" },
            { value: "full", label: "Full" },
          ]}
          onChange={(v) => update({ environmentEffects: v })}
        />
      </SettingRow>
      <SettingRow icon={<Sparkles size={16} />} label="Aurora" description="Northern lights effect (winter maps)">
        <ToggleControl value={g.showAurora} onChange={(v) => update({ showAurora: v })} />
      </SettingRow>
      <SettingRow icon={<Layers size={16} />} label="Anti-Aliasing" description="Smooth edges on canvas">
        <ToggleControl value={g.antiAliasing} onChange={(v) => update({ antiAliasing: v })} />
      </SettingRow>
    </>
  );
}

function LandscapingPanel({ settings, updateCategory }: CategoryPanelProps) {
  const l = settings.landscaping;
  const update = (patch: Partial<GameSettings["landscaping"]>) =>
    updateCategory("landscaping", patch);

  const densityOptions: { value: DecorationDensity; label: string }[] = [
    { value: "minimal", label: "Min" },
    { value: "sparse", label: "Sparse" },
    { value: "normal", label: "Normal" },
    { value: "dense", label: "Dense" },
    { value: "lush", label: "Lush" },
  ];

  return (
    <>
      <SectionDivider label="Vegetation" />
      <SettingRow icon={<Trees size={16} />} label="Decoration Density" description="Overall number of decorations placed on the map" tag="restart">
        <SegmentedControl<DecorationDensity>
          value={l.decorationDensity}
          options={densityOptions}
          onChange={(v) => update({ decorationDensity: v })}
        />
      </SettingRow>
      <SettingRow icon={<Trees size={16} />} label="Tree Clusters" description="Number and size of tree clusters" tag="restart">
        <SegmentedControl<DecorationDensity>
          value={l.treeClusterDensity}
          options={densityOptions}
          onChange={(v) => update({ treeClusterDensity: v })}
        />
      </SettingRow>

      <SectionDivider label="Structures & Villages" />
      <SettingRow icon={<Mountain size={16} />} label="Village Density" description="Number of village clusters" tag="restart">
        <SegmentedControl<DecorationDensity>
          value={l.villageDensity}
          options={densityOptions}
          onChange={(v) => update({ villageDensity: v })}
        />
      </SettingRow>

      <SectionDivider label="Battlefield" />
      <SettingRow icon={<Swords size={16} />} label="Battle Debris" description="Craters, arrows, skeletons" tag="restart">
        <SegmentedControl<BattleDebrisDensity>
          value={l.battleDebrisDensity}
          options={[
            { value: "none", label: "None" },
            { value: "low", label: "Low" },
            { value: "medium", label: "Med" },
            { value: "high", label: "High" },
          ]}
          onChange={(v) => update({ battleDebrisDensity: v })}
        />
      </SettingRow>

      <SectionDivider label="Scaling" />
      <SettingRow icon={<Maximize size={16} />} label="Decoration Scale" description="Size range of placed decorations" tag="restart">
        <SegmentedControl<DecorationScale>
          value={l.decorationScale}
          options={[
            { value: "small", label: "Small" },
            { value: "normal", label: "Normal" },
            { value: "large", label: "Large" },
            { value: "mixed", label: "Mixed" },
          ]}
          onChange={(v) => update({ decorationScale: v })}
        />
      </SettingRow>

      <SectionDivider label="Toggles" />
      <SettingRow icon={<Layers size={16} />} label="Path Decorations" description="Cracks, tufts, surface details on roads" tag="restart">
        <ToggleControl value={l.showPathDecorations} onChange={(v) => update({ showPathDecorations: v })} />
      </SettingRow>
      <SettingRow icon={<Mountain size={16} />} label="Landmarks" description="Major structures (pyramids, castles, etc.)" tag="restart">
        <ToggleControl value={l.showLandmarks} onChange={(v) => update({ showLandmarks: v })} />
      </SettingRow>
      <SettingRow icon={<Cloud size={16} />} label="Water Effects" description="Fountains, pools, water features" tag="restart">
        <ToggleControl value={l.showWaterEffects} onChange={(v) => update({ showWaterEffects: v })} />
      </SettingRow>
    </>
  );
}

function AnimationPanel({ settings, updateCategory }: CategoryPanelProps) {
  const a = settings.animation;
  const update = (patch: Partial<GameSettings["animation"]>) =>
    updateCategory("animation", patch);

  return (
    <>
      <SectionDivider label="Quality" />
      <SettingRow icon={<Activity size={16} />} label="Animation Intensity" description="Overall animation detail level" tag="coming-soon">
        <SegmentedControl<AnimationIntensity>
          value={a.animationIntensity}
          options={[
            { value: "off", label: "Off" },
            { value: "reduced", label: "Low" },
            { value: "normal", label: "Normal" },
            { value: "enhanced", label: "Enhanced" },
          ]}
          onChange={(v) => update({ animationIntensity: v })}
        />
      </SettingRow>

      <SectionDivider label="Screen Effects" />
      <SettingRow icon={<Vibrate size={16} />} label="Screen Shake" description="Intensity of camera shake on impacts" tag="coming-soon">
        <SliderControl
          value={a.screenShakeIntensity}
          min={0}
          max={2}
          step={0.1}
          onChange={(v) => update({ screenShakeIntensity: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>

      <SectionDivider label="Toggles" />
      <SettingRow icon={<Skull size={16} />} label="Death Animations" description="Play animations when enemies die">
        <ToggleControl value={a.deathAnimations} onChange={(v) => update({ deathAnimations: v })} />
      </SettingRow>
      <SettingRow icon={<Crosshair size={16} />} label="Projectile Trails" description="Visual trails on projectiles">
        <ToggleControl value={a.projectileTrails} onChange={(v) => update({ projectileTrails: v })} />
      </SettingRow>
      <SettingRow icon={<Shield size={16} />} label="Tower Animations" description="Tower idle and attack animations" tag="coming-soon">
        <ToggleControl value={a.towerAnimations} onChange={(v) => update({ towerAnimations: v })} />
      </SettingRow>
      <SettingRow icon={<Activity size={16} />} label="Idle Animations" description="Subtle idle movement on decorations" tag="coming-soon">
        <ToggleControl value={a.idleAnimations} onChange={(v) => update({ idleAnimations: v })} />
      </SettingRow>
    </>
  );
}

function CameraPanel({ settings, updateCategory }: CategoryPanelProps) {
  const c = settings.camera;
  const update = (patch: Partial<GameSettings["camera"]>) =>
    updateCategory("camera", patch);

  return (
    <>
      <SectionDivider label="Zoom" />
      <SettingRow icon={<ZoomIn size={16} />} label="Default Zoom" description="Initial zoom level when entering a map" tag="restart">
        <SliderControl
          value={c.defaultZoom}
          min={0.5}
          max={2.0}
          step={0.05}
          onChange={(v) => update({ defaultZoom: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>
      <SettingRow icon={<ZoomIn size={16} />} label="Zoom Sensitivity" description="How fast zooming responds to scroll">
        <SliderControl
          value={c.zoomSensitivity}
          min={0.3}
          max={2.0}
          step={0.1}
          onChange={(v) => update({ zoomSensitivity: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>

      <SectionDivider label="Panning" />
      <SettingRow icon={<MousePointer size={16} />} label="Edge Pan Speed" description="Camera speed when hovering edges" tag="coming-soon">
        <SegmentedControl<CameraEdgePan>
          value={c.edgePanSpeed}
          options={[
            { value: "off", label: "Off" },
            { value: "slow", label: "Slow" },
            { value: "normal", label: "Normal" },
            { value: "fast", label: "Fast" },
          ]}
          onChange={(v) => update({ edgePanSpeed: v })}
        />
      </SettingRow>

      <SectionDivider label="Behavior" />
      <SettingRow icon={<Move size={16} />} label="Smooth Camera" description="Interpolate camera movement" tag="coming-soon">
        <ToggleControl value={c.smoothCamera} onChange={(v) => update({ smoothCamera: v })} />
      </SettingRow>
      <SettingRow icon={<Target size={16} />} label="Zoom to Cursor" description="Zoom towards mouse position">
        <ToggleControl value={c.zoomToCursor} onChange={(v) => update({ zoomToCursor: v })} />
      </SettingRow>
    </>
  );
}

function UIPanel({ settings, updateCategory }: CategoryPanelProps) {
  const u = settings.ui;
  const update = (patch: Partial<GameSettings["ui"]>) =>
    updateCategory("ui", patch);

  return (
    <>
      <SectionDivider label="HUD" />
      <SettingRow icon={<Activity size={16} />} label="FPS Counter" description="Show frames per second">
        <ToggleControl value={u.showFpsCounter} onChange={(v) => update({ showFpsCounter: v })} />
      </SettingRow>
      <SettingRow icon={<PanelTop size={16} />} label="Performance Overlay" description="Show detailed performance stats" tag="coming-soon">
        <ToggleControl value={u.showPerformanceOverlay} onChange={(v) => update({ showPerformanceOverlay: v })} />
      </SettingRow>

      <SectionDivider label="Combat Feedback" />
      <SettingRow icon={<Swords size={16} />} label="Damage Numbers" description="Floating damage values">
        <SegmentedControl<DamageNumberStyle>
          value={u.damageNumbers}
          options={[
            { value: "off", label: "Off" },
            { value: "simple", label: "Simple" },
            { value: "animated", label: "Animated" },
          ]}
          onChange={(v) => update({ damageNumbers: v })}
        />
      </SettingRow>
      <SettingRow icon={<Heart size={16} />} label="Health Bars" description="Show enemy health bars">
        <ToggleControl value={u.showHealthBars} onChange={(v) => update({ showHealthBars: v })} />
      </SettingRow>

      <SectionDivider label="Tower Indicators" />
      <SettingRow icon={<Radio size={16} />} label="Range Indicators" description="Show tower range on hover">
        <ToggleControl value={u.showRangeIndicators} onChange={(v) => update({ showRangeIndicators: v })} />
      </SettingRow>
      <SettingRow icon={<Target size={16} />} label="Tower Radii" description="Show radius circles during placement">
        <ToggleControl value={u.showTowerRadii} onChange={(v) => update({ showTowerRadii: v })} />
      </SettingRow>
      <SettingRow icon={<Star size={16} />} label="Tower Badges" description="Show level stars and upgrade path badges on towers">
        <ToggleControl value={u.showTowerBadges} onChange={(v) => update({ showTowerBadges: v })} />
      </SettingRow>

      <SectionDivider label="Gameplay" />
      <SettingRow icon={<Layers size={16} />} label="Wave Preview" description="Show upcoming wave composition">
        <ToggleControl value={u.showWavePreview} onChange={(v) => update({ showWavePreview: v })} />
      </SettingRow>
      <SettingRow icon={<FastForward size={16} />} label="Auto-Send Waves" description="Automatically start next wave when timer expires">
        <ToggleControl value={u.autoSendWaves} onChange={(v) => update({ autoSendWaves: v })} />
      </SettingRow>

      <SectionDivider label="Interface Scale" />
      <SettingRow icon={<Maximize size={16} />} label="UI Scale" description="Size of HUD elements" tag="coming-soon">
        <SegmentedControl<UIScale>
          value={u.uiScale}
          options={[
            { value: "compact", label: "Compact" },
            { value: "normal", label: "Normal" },
            { value: "large", label: "Large" },
          ]}
          onChange={(v) => update({ uiScale: v })}
        />
      </SettingRow>
      <SettingRow icon={<Clock size={16} />} label="Tooltip Delay" description="Milliseconds before tooltips appear" tag="coming-soon">
        <SliderControl
          value={u.tooltipDelay}
          min={0}
          max={1000}
          step={100}
          onChange={(v) => update({ tooltipDelay: v })}
          formatLabel={(v) => `${v}ms`}
        />
      </SettingRow>
    </>
  );
}

function AudioPanel({ settings, updateCategory }: CategoryPanelProps) {
  const au = settings.audio;
  const update = (patch: Partial<GameSettings["audio"]>) =>
    updateCategory("audio", patch);

  return (
    <>
      <SectionDivider label="Volume" />
      <SettingRow icon={<Volume2 size={16} />} label="Master Volume" description="Overall audio level" tag="coming-soon">
        <SliderControl
          value={au.masterVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update({ masterVolume: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>
      <SettingRow icon={<Zap size={16} />} label="SFX Volume" description="Sound effects (attacks, abilities)" tag="coming-soon">
        <SliderControl
          value={au.sfxVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update({ sfxVolume: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>
      <SettingRow icon={<Headphones size={16} />} label="Music Volume" description="Background music" tag="coming-soon">
        <SliderControl
          value={au.musicVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update({ musicVolume: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>
      <SettingRow icon={<Wind size={16} />} label="Ambient Volume" description="Environmental sounds (wind, water)" tag="coming-soon">
        <SliderControl
          value={au.ambientVolume}
          min={0}
          max={1}
          step={0.05}
          onChange={(v) => update({ ambientVolume: v })}
          formatLabel={(v) => `${Math.round(v * 100)}%`}
        />
      </SettingRow>

      <SectionDivider label="Behavior" />
      <SettingRow icon={<VolumeX size={16} />} label="Mute When Unfocused" description="Silence audio when tab is inactive" tag="coming-soon">
        <ToggleControl value={au.muteWhenUnfocused} onChange={(v) => update({ muteWhenUnfocused: v })} />
      </SettingRow>
    </>
  );
}

function AccessibilityPanel({ settings, updateCategory }: CategoryPanelProps) {
  const acc = settings.accessibility;
  const update = (patch: Partial<GameSettings["accessibility"]>) =>
    updateCategory("accessibility", patch);

  return (
    <>
      <SectionDivider label="Vision" />
      <SettingRow icon={<Eye size={16} />} label="Colorblind Mode" description="Adjust colors for color vision deficiency" tag="coming-soon">
        <SegmentedControl<ColorblindMode>
          value={acc.colorblindMode}
          options={[
            { value: "off", label: "Off" },
            { value: "protanopia", label: "Protan" },
            { value: "deuteranopia", label: "Deuter" },
            { value: "tritanopia", label: "Tritan" },
          ]}
          onChange={(v) => update({ colorblindMode: v })}
        />
      </SettingRow>
      <SettingRow icon={<Contrast size={16} />} label="High Contrast UI" description="Increase contrast on UI elements" tag="coming-soon">
        <ToggleControl value={acc.highContrastUI} onChange={(v) => update({ highContrastUI: v })} />
      </SettingRow>

      <SectionDivider label="Motion" />
      <SettingRow icon={<Accessibility size={16} />} label="Reduced Motion" description="Minimize animations and movement" tag="coming-soon">
        <ToggleControl value={acc.reducedMotion} onChange={(v) => update({ reducedMotion: v })} />
      </SettingRow>

      <SectionDivider label="Readability" />
      <SettingRow icon={<Type size={16} />} label="Large Text" description="Increase text size throughout UI" tag="coming-soon">
        <ToggleControl value={acc.largeText} onChange={(v) => update({ largeText: v })} />
      </SettingRow>
      <SettingRow icon={<AlertCircle size={16} />} label="Screen Reader Hints" description="Additional ARIA labels for assistive tech" tag="coming-soon">
        <ToggleControl value={acc.screenReaderHints} onChange={(v) => update({ screenReaderHints: v })} />
      </SettingRow>
    </>
  );
}

// =============================================================================
// TAB DEFINITIONS
// =============================================================================

interface TabDef {
  id: SettingsCategory;
  label: string;
  icon: React.ReactNode;
  panel: React.FC<CategoryPanelProps>;
}

const TABS: TabDef[] = [
  { id: "graphics", label: "Graphics", icon: <Monitor size={18} />, panel: GraphicsPanel },
  { id: "landscaping", label: "Landscaping", icon: <Trees size={18} />, panel: LandscapingPanel },
  { id: "animation", label: "Animation", icon: <Sparkles size={18} />, panel: AnimationPanel },
  { id: "camera", label: "Camera", icon: <Move size={18} />, panel: CameraPanel },
  { id: "ui", label: "Interface", icon: <LayoutDashboard size={18} />, panel: UIPanel },
  { id: "audio", label: "Audio", icon: <Volume2 size={18} />, panel: AudioPanel },
  { id: "accessibility", label: "Accessibility", icon: <Eye size={18} />, panel: AccessibilityPanel },
];

// =============================================================================
// PRESET SELECTOR
// =============================================================================

const PRESET_BUTTONS: { value: QualityPreset; label: string; desc: string }[] = [
  { value: "potato", label: "Potato", desc: "Bare minimum for low-end devices" },
  { value: "low", label: "Low", desc: "Reduced effects for better FPS" },
  { value: "medium", label: "Medium", desc: "Balanced visuals and performance" },
  { value: "high", label: "High", desc: "Full quality (default)" },
  { value: "ultra", label: "Ultra", desc: "Maximum detail everywhere" },
];

// =============================================================================
// SETTINGS MODAL
// =============================================================================

export interface SettingsModalProps {
  onClose: () => void;
  settings: GameSettings;
  updateCategory: <K extends SettingsCategory>(
    category: K,
    patch: Partial<GameSettings[K]>
  ) => void;
  applyPreset: (preset: QualityPreset) => void;
  resetToDefaults: () => void;
  resetCategory: (category: SettingsCategory) => void;
  onDevModeChange?: (enabled: boolean) => void;
}

const DEV_PASSWORD = "princetonpowerlifting";

function readDevModeFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DEV_MODE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeDevModeToStorage(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (enabled) {
      window.localStorage.setItem(DEV_MODE_STORAGE_KEY, "1");
    } else {
      window.localStorage.removeItem(DEV_MODE_STORAGE_KEY);
    }
  } catch { /* noop */ }
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  settings,
  updateCategory,
  applyPreset,
  resetToDefaults,
  resetCategory,
  onDevModeChange,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsCategory>("graphics");
  const [showPresets, setShowPresets] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [devPassword, setDevPassword] = useState("");
  const [devUnlocked, setDevUnlocked] = useState(readDevModeFromStorage);
  const [devPasswordError, setDevPasswordError] = useState(false);

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const PanelComponent = activeTabDef.panel;

  const handlePreset = useCallback(
    (preset: QualityPreset) => {
      applyPreset(preset);
      setShowPresets(false);
    },
    [applyPreset]
  );

  const handleResetAll = useCallback(() => {
    if (confirmReset) {
      resetToDefaults();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }, [confirmReset, resetToDefaults]);

  const handleDevPasswordSubmit = useCallback(() => {
    if (devPassword === DEV_PASSWORD) {
      setDevUnlocked(true);
      writeDevModeToStorage(true);
      setDevPassword("");
      setDevPasswordError(false);
      onDevModeChange?.(true);
    } else {
      setDevPasswordError(true);
      setTimeout(() => setDevPasswordError(false), 2000);
    }
  }, [devPassword, onDevModeChange]);

  const handleDevModeDisable = useCallback(() => {
    setDevUnlocked(false);
    writeDevModeToStorage(false);
    onDevModeChange?.(false);
  }, [onDevModeChange]);

  return (
    <div
      className="fixed inset-0 z-[1500] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: OVERLAY.black60 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: panelGradient,
          border: `2px solid ${GOLD.border35}`,
          boxShadow: `0 0 40px ${GOLD.glow07}, inset 0 0 30px ${GOLD.glow04}`,
        }}
      >
        <OrnateFrame className="relative w-full h-full overflow-hidden flex flex-col" cornerSize={48}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{
            borderColor: GOLD.border25,
          }}
        >
          <div className="flex items-center gap-3">
            <Monitor size={22} className="text-amber-400" />
            <h2 className="text-xl font-bold text-amber-200 tracking-wide">
              Settings
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Preset dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: PANEL.bgDeep,
                  border: `1px solid ${GOLD.innerBorder12}`,
                  color: "rgba(253,230,138,0.8)",
                }}
              >
                <Zap size={14} />
                Presets
                <ChevronDown size={14} className={`transition-transform ${showPresets ? "rotate-180" : ""}`} />
              </button>
              {showPresets && (
                <div
                  className="absolute top-full right-0 mt-2 w-64 rounded-lg overflow-hidden z-50"
                  style={{
                    background: PANEL.bgDark,
                    border: `1px solid ${GOLD.border30}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                  }}
                >
                  {PRESET_BUTTONS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handlePreset(p.value)}
                      className="w-full px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <div className="text-sm font-semibold text-amber-200">
                        {p.label}
                      </div>
                      <div className="text-xs text-amber-200/40 mt-0.5">
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: confirmReset ? "rgba(180,60,60,0.3)" : PANEL.bgDeep,
                border: `1px solid ${confirmReset ? "rgba(180,60,60,0.5)" : GOLD.innerBorder12}`,
                color: confirmReset ? "rgba(255,150,150,0.9)" : "rgba(253,230,138,0.6)",
              }}
            >
              <RotateCcw size={14} />
              {confirmReset ? "Confirm?" : "Reset All"}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ color: "rgba(253,230,138,0.5)" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden" style={{ background: PANEL.bgDark }}>
          {/* Sidebar tabs */}
          <div
            className="w-48 flex-shrink-0 overflow-y-auto border-r"
            style={{
              background: PANEL.bgDeepSolid,
              borderColor: GOLD.innerBorder08,
            }}
          >
            <div className="py-2 flex flex-col h-full">
              <div className="flex-1">
                {TABS.map((tab) => {
                  const active = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all"
                      style={{
                        background: active
                          ? `linear-gradient(90deg, rgba(180,140,60,0.15), transparent)`
                          : "transparent",
                        borderRight: active ? `2px solid rgba(251,191,36,0.6)` : "2px solid transparent",
                        color: active ? "rgba(253,230,138,0.9)" : "rgba(253,230,138,0.45)",
                      }}
                    >
                      <span className={active ? "text-amber-400" : "text-amber-600/50"}>
                        {tab.icon}
                      </span>
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Developer Mode */}
              <div
                className="mt-auto px-3 pt-3 pb-4 border-t"
                style={{ borderColor: GOLD.innerBorder08 }}
              >
                <div className="flex items-center gap-2 mb-2.5">
                  <span style={{ color: devUnlocked ? "rgba(74,222,128,0.8)" : "rgba(253,230,138,0.35)" }}>
                    {devUnlocked ? <Unlock size={14} /> : <Lock size={14} />}
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: devUnlocked ? "rgba(74,222,128,0.8)" : "rgba(253,230,138,0.35)" }}
                  >
                    Developer
                  </span>
                </div>
                {devUnlocked ? (
                  <button
                    onClick={handleDevModeDisable}
                    className="w-full px-2 py-1.5 rounded text-xs font-medium transition-colors"
                    style={{
                      background: "rgba(74,222,128,0.1)",
                      border: "1px solid rgba(74,222,128,0.25)",
                      color: "rgba(74,222,128,0.8)",
                    }}
                  >
                    Enabled — Disable
                  </button>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="password"
                      value={devPassword}
                      onChange={(e) => setDevPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleDevPasswordSubmit();
                      }}
                      placeholder="Password"
                      className="w-full px-2 py-1.5 rounded text-xs"
                      style={{
                        background: PANEL.bgDeep,
                        border: `1px solid ${devPasswordError ? "rgba(239,68,68,0.5)" : GOLD.innerBorder10}`,
                        color: "rgba(253,230,138,0.7)",
                        outline: "none",
                      }}
                    />
                    {devPasswordError && (
                      <span className="text-xs" style={{ color: "rgba(239,68,68,0.8)" }}>
                        Wrong password
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Category header + reset */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b"
              style={{
                background: PANEL.bgDark,
                borderColor: GOLD.innerBorder08,
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400">{activeTabDef.icon}</span>
                <h3 className="text-base font-semibold text-amber-200">
                  {activeTabDef.label}
                </h3>
              </div>
              <button
                onClick={() => resetCategory(activeTab)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors hover:bg-white/[0.04]"
                style={{ color: "rgba(253,230,138,0.4)" }}
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            <div className="pb-6">
              <PanelComponent
                settings={settings}
                updateCategory={updateCategory}
              />
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div
          className="px-6 py-2.5 text-center text-xs border-t"
          style={{
            background: PANEL.bgDeepSolid,
            borderColor: GOLD.innerBorder08,
            color: "rgba(253,230,138,0.3)",
          }}
        >
          Changes to landscaping density require reloading the map to take effect
        </div>
      </OrnateFrame>
      </div>
    </div>
  );
};
