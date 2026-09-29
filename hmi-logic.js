(function (root) {
  'use strict';

  // Every docs/salmon-pilot/fault-list.md row that fits the generic
  // trigger->delay->Fault/Alert->action->reset shape, plus fault #25
  // (Emergency_Stop) which is real in firmware (fault_logic.cpp's
  // FAULT_EMERGENCY_STOP = 25) but missing from fault-list.md itself - a
  // pre-existing doc gap, not fixed here (see the design spec's Open
  // items). Ids 5, 15, 18 are real gaps in the source list, not missing
  // transcriptions.
  const FAULTS = [
    { id: 1, title: 'P1_Overload_Fault', zone: 'TAYA 1', type: 'Fault', reset: 'Manual' },
    { id: 2, title: 'P2_Overload_Fault', zone: 'TAYA 2', type: 'Fault', reset: 'Manual' },
    { id: 3, title: 'P3_Overload_Fault', zone: 'Sugar tank', type: 'Alert', reset: 'Manual' },
    { id: 4, title: 'P4_Overload_Fault', zone: 'Inlet', type: 'Fault', reset: 'Manual' },
    { id: 6, title: 'LS0_Low_level', zone: 'Sugar tank', type: 'Fault', reset: 'Auto' },
    { id: 7, title: 'LT01_Low_level', zone: 'TAYA 1', type: 'Alert', reset: 'Auto' },
    { id: 8, title: 'LT02_Low_level', zone: 'TAYA 2', type: 'Alert', reset: 'Auto' },
    { id: 9, title: 'LT01_Overflow_Fault', zone: 'TAYA 1', type: 'Fault', reset: 'Manual' },
    { id: 10, title: 'LT02_Overflow_Fault', zone: 'TAYA 2', type: 'Fault', reset: 'Manual' },
    { id: 11, title: 'Pump_P1_low_level', zone: 'TAYA 1', type: 'Fault', reset: 'Auto' },
    { id: 12, title: 'Pump_P2_low_level', zone: 'TAYA 2', type: 'Fault', reset: 'Auto' },
    { id: 13, title: 'FIT101_No_Pulse', zone: 'Inlet', type: 'Fault', reset: 'Manual' },
    { id: 14, title: 'LT01_4-20_Fault', zone: 'TAYA 1', type: 'Fault', reset: 'Manual' },
    { id: 16, title: 'LT02_4-20_Fault', zone: 'TAYA 2', type: 'Fault', reset: 'Manual' },
    { id: 17, title: 'AIT01_NO3_Low_Concentration', zone: 'Inlet/Effluent', type: 'Alert', reset: 'Auto' },
    { id: 19, title: 'AIT01_NO3_High_Concentration', zone: 'Inlet/Effluent', type: 'Alert', reset: 'Auto' },
    { id: 20, title: 'System_Switch_Off', zone: 'General', type: 'Alert', reset: 'Auto' },
    { id: 21, title: 'AIT01_4_20_Fault', zone: 'Inlet', type: 'Fault', reset: 'Manual' },
    { id: 22, title: 'Average_level_Low', zone: 'TAYA 1&2', type: 'Fault', reset: 'Manual' },
    { id: 23, title: 'Average_level_High', zone: 'TAYA 1&2', type: 'Alert', reset: 'Auto' },
    { id: 24, title: 'Half_cycle_timer_SP_too_small', zone: 'TAYA 1&2', type: 'Alert', reset: 'Manual' },
    { id: 25, title: 'Emergency_Stop', zone: 'General', type: 'Fault', reset: 'Manual' },
  ];

  // FaultBitmask (telemetry): bit N set iff fault-list.md id N is
  // currently tripped (fault_logic.h's faultBitmask()). Bit 0 is always 0.
  function decodeFaultBitmask(bitmask) {
    const active = [];
    for (const fault of FAULTS) {
      if ((bitmask >>> fault.id) & 1) active.push(fault);
    }
    return active;
  }

  // Real operator setpoints from setpoints.cpp's setpoints[] table
  // (docs/salmon-pilot/tag-list.md). Excludes the *_SimValue entries -
  // those are a separate advanced/debug section, not day-to-day operator
  // settings (see the design spec's Setpoints page section).
  const SETPOINTS = [
    { name: 'SP_L11', group: 'Levels', label: 'Min level TAYA 1 Large', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L12', group: 'Levels', label: 'Max level TAYA 1 Large', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L13', group: 'Levels', label: 'Min level TAYA 1 Small', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L14', group: 'Levels', label: 'Max level TAYA 1 Small', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L21', group: 'Levels', label: 'Min level TAYA 2 Large', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L22', group: 'Levels', label: 'Max level TAYA 2 Large', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L23', group: 'Levels', label: 'Min level TAYA 2 Small', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L24', group: 'Levels', label: 'Max level TAYA 2 Small', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L3', group: 'Levels', label: 'Overflow Level', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L4', group: 'Levels', label: 'Minimum Level Pump Protection', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L5', group: 'Levels', label: 'Average level Low', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L6', group: 'Levels', label: 'Average level High', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_N1', group: 'NO3', label: 'Low nitrate Alert', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N2', group: 'NO3', label: 'High nitrate Alert', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N3', group: 'NO3', label: 'Desired NO3 Concentration', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N4', group: 'NO3', label: 'SP_N3 dosing-loop deadband', unit: 'ppm', min: 0, max: 100 },
    { name: 'SP_N5', group: 'NO3', label: 'Auto dosing start/resume threshold', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N6', group: 'NO3', label: 'Auto dosing stop threshold', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_F01', group: 'Dosing', label: 'Manual Dosing pump Flow', unit: 'ml/hr', min: 0, max: 2280 },
    { name: 'SP_F02', group: 'Dosing', label: 'NO3 Dosing pump Flow', unit: 'ml/hr', min: 0, max: 2280 },
    { name: 'SP_F03', group: 'Dosing', label: 'Dosing pump change step', unit: 'ml/hr', min: 0, max: 100 },
    { name: 'SP_F04', group: 'Dosing', label: 'Dosing pump stroke length', unit: '%', min: 0, max: 100 },
    { name: 'T_11', group: 'Timers', label: 'P1 On Timer (max run time)', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_12', group: 'Timers', label: 'P2 On Timer (max run time)', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_13', group: 'Timers', label: 'Timer Half cycle large', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_14', group: 'Timers', label: 'Timer Half cycle small', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_15', group: 'Timers', label: 'Time to change SP_F02', unit: 'min', min: 0, max: 65535 },
    { name: 'T_16', group: 'Timers', label: 'Step Timer', unit: 'sec', min: 0, max: 86400 },
    { name: 'SP_L1_4mA', group: 'Calibration', label: 'LT01 raw ADC at 4mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L1_20mA', group: 'Calibration', label: 'LT01 raw ADC at 20mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L2_4mA', group: 'Calibration', label: 'LT02 raw ADC at 4mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L2_20mA', group: 'Calibration', label: 'LT02 raw ADC at 20mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_N_4mA', group: 'Calibration', label: 'AIT01_NO3 raw ADC at 4mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_N_20mA', group: 'Calibration', label: 'AIT01_NO3 raw ADC at 20mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L1_Eng4', group: 'Calibration', label: 'TAYA 1 level at 4 mA', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L1_Eng20', group: 'Calibration', label: 'TAYA 1 level at 20 mA', unit: 'cm', min: 1, max: 1000 },
    { name: 'SP_L2_Eng4', group: 'Calibration', label: 'TAYA 2 level at 4 mA', unit: 'cm', min: 0, max: 400 },
    { name: 'SP_L2_Eng20', group: 'Calibration', label: 'TAYA 2 level at 20 mA', unit: 'cm', min: 1, max: 1000 },
    { name: 'SP_N_Eng4', group: 'Calibration', label: 'NO3 at 4 mA', unit: '0.1 ppm', min: 0, max: 20000 },
    { name: 'SP_N_Eng20', group: 'Calibration', label: 'NO3 at 20 mA', unit: '0.1 ppm', min: 1, max: 20000 },
  ];

  // Telemetry (mqtt_client.cpp's publishTelemetry()) fixed-point scaling.
  // LT01/LT02 are already in cm (analog_reader.cpp's getScaledAnalogRegister
  // only multiplies AIT01_NO3 by 10). FT101_accumulated is reported x100.
  const SCALE_DIVISORS = { AIT01_NO3: 10, FT101_accumulated: 100, NO3_Inlet_Avg: 10 };
  function scaleTelemetryValue(tag, raw) {
    const divisor = SCALE_DIVISORS[tag];
    return divisor ? raw / divisor : raw;
  }

  // Mirrors daily_email.cpp's packString()/unpackString() exactly: 2 ASCII
  // bytes per register, big-endian (hi = even offset, lo = odd offset),
  // NUL-padded. `count` registers hold up to count*2 ASCII bytes.
  // unpackRegistersToEmail() terminates correctly either by finding a NUL
  // byte or by exhausting the registers array.
  function packEmailToRegisters(email, count) {
    if (email.length > count * 2) {
      throw new Error('email too long for ' + count + ' registers');
    }
    const regs = new Array(count).fill(0);
    for (let i = 0; i < count; i++) {
      const p0 = i * 2;
      const hi = p0 < email.length ? email.charCodeAt(p0) : 0;
      const lo = (p0 + 1) < email.length ? email.charCodeAt(p0 + 1) : 0;
      regs[i] = ((hi & 0xFF) << 8) | (lo & 0xFF);
    }
    return regs;
  }

  function unpackRegistersToEmail(registers) {
    let out = '';
    for (const reg of registers) {
      const hi = (reg >> 8) & 0xFF;
      const lo = reg & 0xFF;
      if (hi === 0) break;
      out += String.fromCharCode(hi);
      if (lo === 0) break;
      out += String.fromCharCode(lo);
    }
    return out;
  }

  // Step table from docs/salmon-pilot/control-logic.md.
  const STEP_NAMES = {
    100: 'System OFF / Fault', 102: 'Stand-by', 104: 'TAYA 1 min-level delay',
    106: 'P1 ON (pump tank 1)', 108: 'TAYA 2 min-level delay', 110: 'P2 ON (pump tank 2)',
  };
  function stepName(step) { return STEP_NAMES[step] || ('Step ' + step); }
  // Plain-language step for the mimic banner: which way water is moving.
  const STEP_FLOW = {
    106: 'P1 transferring TAYA 1 → TAYA 2', 110: 'P2 transferring TAYA 2 → TAYA 1',
  };
  function stepDescription(step) { return STEP_FLOW[step] || stepName(step); }
  // "106-L" / "106-S" - B13 large/small. At 100/102 it's the NEXT half's type.
  function stepLabel(step, cycleIsLarge) {
    if (typeof step !== 'number') return '—';
    return step + '-' + (cycleIsLarge ? 'L' : 'S');
  }

  // Same order as the firmware's SIM_POINTS / *_Sim coils 17-23:
  // bit (n+1) of telemetry Sim_Mask = SIM_POINTS[n]; bit 0 unused.
  // Digital points carry their own option labels: LS0_low is active-low
  // (1 = level OK, 0 = LOW), so a generic "on/off" would mislead.
  const ON_OFF = [{ value: 1, label: '1 (on)' }, { value: 0, label: '0 (off)' }];
  const SIM_POINTS = [
    { name: 'System_Switch', label: 'System switch', kind: 'digital', options: ON_OFF },
    { name: 'Reset_Inactive_Alarms', label: 'Reset button', kind: 'digital',
      options: [{ value: 1, label: '1 (pressed)' }, { value: 0, label: '0 (released)' }] },
    { name: 'LS0_low', label: 'Sugar tank level switch (LS0)', kind: 'digital',
      options: [{ value: 1, label: '1 (level OK)' }, { value: 0, label: '0 (LOW)' }] },
    { name: 'FT101_P', label: 'Inlet flow pulse (FT101)', kind: 'digital', options: ON_OFF },
    { name: 'LT01', label: 'TAYA 1 level (LT01)', kind: 'analog', unit: 'cm', min: 0, max: 400 },
    { name: 'LT02', label: 'TAYA 2 level (LT02)', kind: 'analog', unit: 'cm', min: 0, max: 400 },
    { name: 'AIT01_NO3', label: 'NO3 (AIT01)', kind: 'analog', unit: 'ppm', min: 0, max: 1000 },
  ];
  function simPointsFromMask(mask) {
    const out = [];
    SIM_POINTS.forEach((p, i) => { if ((mask >>> (i + 1)) & 1) out.push(p.name); });
    return out;
  }
  // Value first, then the enable coil, in one atomic dash batch - so the
  // point never flips to simulated with a stale value.
  function simEnableWrites(point, value) {
    return [{ point: point + '_SimValue', value: value }, { point: point + '_Sim', value: 1 }];
  }
  function realValue(point, t) {
    const raw = (point + '_Raw') in t ? t[point + '_Raw'] : t[point];
    if (typeof raw !== 'number') return null;
    return scaleTelemetryValue(point, raw);
  }
  // Display text for a sim point's value: the option label for digital
  // points, value + unit for analog ones, "unknown" when missing.
  function simValueText(point, value) {
    if (value === null || value === undefined) return 'unknown';
    const p = SIM_POINTS.find(x => x.name === point);
    const opt = p && p.options ? p.options.find(o => o.value === value) : null;
    if (opt) return opt.label;
    return value + (p && p.unit ? ' ' + p.unit : '');
  }
  function simConfirmMessage(point, value, real) {
    const p = SIM_POINTS.find(x => x.name === point);
    return 'Simulate ' + (p ? p.label : point) + ' = ' + simValueText(point, value) +
      '? Real value is ' + simValueText(point, real) + '.';
  }

  // Dash-channel writes are integers, so whole numbers only.
  function validateNumber(def, text) {
    const s = String(text === undefined || text === null ? '' : text).trim();
    if (!/^-?\d+$/.test(s)) return { ok: false, reason: 'Enter a whole number' };
    const v = parseInt(s, 10);
    if (v < def.min || v > def.max) {
      return { ok: false, reason: 'Allowed range ' + def.min + '–' + def.max + (def.unit ? ' ' + def.unit : '') };
    }
    return { ok: true, value: v };
  }
  // edited: {name: raw input text} for touched fields only. Blank = untouched.
  function setpointDiff(original, edited) {
    const changes = [], errors = [];
    SETPOINTS.forEach(sp => {
      if (!(sp.name in edited)) return;
      if (String(edited[sp.name]).trim() === '') return;
      const r = validateNumber(sp, edited[sp.name]);
      if (!r.ok) { errors.push({ name: sp.name, label: sp.label, reason: r.reason }); return; }
      const from = typeof original[sp.name] === 'number' ? original[sp.name] : null;
      if (from !== r.value) changes.push({ name: sp.name, label: sp.label, from: from, to: r.value });
    });
    return { changes, errors };
  }

  // Fault-list ids of the pump overload faults (fault-list.md).
  const PUMP_FAULT_ID = { P1: 1, P2: 2, P3: 3, P4: 4 };
  function pumpRunningFromStep(pump, t) {
    const s = t.Step;
    if (typeof s !== 'number') return false;
    switch (pump) {
      case 'P1': return s === 106;
      case 'P2': return s === 110;
      case 'P3': return s !== 100;
      case 'P4': return s >= 104 && s <= 110;
      case 'DP1': return (t.Dosing_Flow || 0) > 0;
      default: return false;
    }
  }
  // coils: {P1_ON, P1_Mode, ...} from the operator bulk read (may be empty
  // for a viewer login - then running falls back to what the step implies).
  // Firmware: P*_Mode 0 = AUTO, 1 = MANUAL (sequencer.cpp modeIsAuto()).
  function pumpState(pump, t, coils) {
    coils = coils || {};
    t = t || {};
    const on = coils[pump + '_ON'];
    const running = typeof on === 'number' ? on === 1 : pumpRunningFromStep(pump, t);
    // manual: null = unknown (Mode coil not read yet, or viewer login).
    const mode = coils[pump + '_Mode'];
    const manual = typeof mode === 'number' ? mode === 1 : null;
    let fault = false;
    if (pump === 'DP1') fault = t.DP1_Fault === 1;
    else if (typeof t.FaultBitmask === 'number') fault = ((t.FaultBitmask >>> PUMP_FAULT_ID[pump]) & 1) === 1;
    return { running, manual, fault };
  }

  // b14Auto: true/false from the B14 coil read, undefined if unknown.
  function dosingText(t, b14Auto) {
    if (typeof t.Dosing_Flow !== 'number') return '—';
    let mode = '';
    if (t.Force_B14_Manual === 1) mode = ' · manual (forced)';
    else if (b14Auto === true) mode = ' · auto';
    else if (b14Auto === false) mode = ' · manual';
    return t.Dosing_Flow + ' mL/h' + mode;
  }

  // Dash batch-write reply (dash_channel.cpp handleBatchWrite): a top-level
  // ok:false means nothing was applied; ok:true carries results[] with a
  // per-point ok, and any ok:false there is a partial failure.
  function batchOutcome(resp) {
    resp = resp || {};
    if (!resp.ok) {
      const err = (resp.error || 'unknown') + (resp.failed_point ? ' (' + resp.failed_point + ')' : '');
      return { applied: false, partial: false, failed: [], error: err };
    }
    const failed = (Array.isArray(resp.results) ? resp.results : [])
      .filter(r => r && r.ok === false)
      .map(r => ({ point: r.point, error: r.error || 'unknown' }));
    return { applied: failed.length === 0, partial: failed.length > 0, failed, error: null };
  }

  function alarmSummary(bitmask) {
    const n = typeof bitmask === 'number' ? decodeFaultBitmask(bitmask).length : 0;
    return { count: n, text: n === 0 ? 'No alarms' : (n === 1 ? '1 alarm' : n + ' alarms') };
  }

  // Session-only trend buffers for the Overview sparklines.
  function createRing(capacity) {
    const buf = [];
    return {
      push(v) {
        if (typeof v !== 'number' || !isFinite(v)) return;
        buf.push(v);
        if (buf.length > capacity) buf.shift();
      },
      values() { return buf.slice(); },
    };
  }
  function sparklinePath(values, width, height) {
    if (values.length < 2) return '';
    const min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    const span = (max - min) || 1;
    return values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / span) * height;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
  }

  // Canned telemetry for ?demo=<name> (design review / screenshots only).
  const DEMO_BASE = {
    System_Switch: 1, Reset_Inactive_Alarms: 0, Q_Stop: 1, P1_OL: 1, P2_OL: 1, P3_OL: 1,
    P4_OL: 1, P5_OL: 1, FT101_P: 0, LS0_low: 1, LT01: 104, LT02: 82, AIT01_NO3: 421,
    FT101_accumulated: 182, ActiveFaultCount: 0, FaultBitmask: 0, HMI_Run: 1, TAYA_Fault: 0,
    Inlet_Fault: 0, Sugar_Fault: 0, DP1_Fault: 0, P3_Fault: 0, Force_B14_Manual: 0,
    Emergency_Stop: 0, C_10: 7, C_11: 4, C_12: 3, C_13: 2.1, C_14: 1.9,
    Step: 106, Cycle_Type: 1, FT101_Flow_Lh: 1820, Dosing_Flow: 350, NO3_Inlet_Avg: 418,
    Inlet_Total_L: 125400, DP1_Total_Strokes: 88210, Sim_Mask: 0, SD_OK: 1,
    ActiveTransport: 1, WiFi_Connected: 1, WiFi_RSSI: -61, Loop_Max_ms: 24,
    LT01_ADC: 1464, LT01_mA: 16.64, LT02_ADC: 1256, LT02_mA: 14.56, AIT01_NO3_ADC: 537, AIT01_NO3_mA: 7.37,
  };
  const DEMO_FRAMES = {
    normal: Object.assign({}, DEMO_BASE),
    alarm: Object.assign({}, DEMO_BASE, {
      P1_OL: 0,
      Step: 102, Cycle_Type: 0, ActiveFaultCount: 3, TAYA_Fault: 1,
      FaultBitmask: (1 << 1) | (1 << 9) | (1 << 17), LT01: 168, AIT01_NO3: 38,
    }),
    sim: Object.assign({}, DEMO_BASE, {
      Sim_Mask: (1 << 3) | (1 << 5), LT01: 120, LT01_Raw: 85, LS0_low: 1, LS0_low_Raw: 0,
    }),
  };

  // Retained plc/<id>/boot message (firmware 2026-09-24-v6+): what the
  // System page shows about the last restart. Crash/watchdog/brownout are
  // flagged abnormal - a crash loop shows up here immediately.
  const BOOT_REASONS = {
    power_on: 'Power on', external: 'External reset',
    software: 'Software restart (update or reboot command)',
    crash: 'Crash (firmware fault)', watchdog: 'Watchdog reset',
    brownout: 'Brownout (supply voltage dip)', deep_sleep: 'Wake from sleep',
  };
  const BOOT_ABNORMAL = { crash: true, watchdog: true, brownout: true };
  const TRANSPORT_NAMES = { 0: 'None', 1: 'Ethernet', 2: 'WiFi', 3: 'LTE' };
  function describeBoot(boot) {
    if (!boot) return null;
    const reset = boot.reset || 'unknown';
    const hasTime = typeof boot.t === 'number' && boot.t > 0;
    const upS = Math.floor((Number(boot.uptime_ms) || 0) / 1000);
    return {
      build: boot.build || '—',
      reasonText: BOOT_REASONS[reset] || ('Unknown (' + reset + ')'),
      abnormal: !!BOOT_ABNORMAL[reset],
      imageText: boot.image === 'pending_verify' ? 'New update, not yet confirmed' : 'Confirmed',
      transportText: TRANSPORT_NAMES[boot.transport] || 'Unknown',
      wifiText: boot.wifi ? 'WiFi connected' : 'WiFi not connected',
      sd: sdCardStatus(boot.sd_ok),
      bootedAt: hasTime ? new Date((boot.t - upS) * 1000) : null,
    };
  }

  // SD_OK telemetry / sd_ok boot key (firmware v9+): 1 = card mounted at
  // boot. Missing means no CSV logs and no daily digest attachments.
  // null = key absent (older firmware), so the HMI shows nothing.
  function sdCardStatus(v) {
    if (v === 1) return { text: 'OK', abnormal: false };
    if (v === 0) return { text: 'missing or failed (no data logging)', abnormal: true };
    return null;
  }

  // ---- SD-card history (spec 2026-09-27-web-hmi-trends-history-design) ----
  // Rows as the PLC sends them: [t, lt01, lt02, no3, flow, dosing, step, cycle];
  // with mm (min/max buckets) each value is [min, max] or null.
  const HIST_KEYS = ['lt01', 'lt02', 'no3', 'flow', 'dosing'];

  function historyWindow(hours, nowMs) {
    const to = Math.floor(nowMs / 1000);
    return { from: to - hours * 3600, to };
  }

  // Local date 'YYYY-MM-DD' + 'HH:MM' in the browser's time zone.
  function historyWindowAt(dateStr, timeStr, hours) {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr || '');
    const t = /^(\d{2}):(\d{2})$/.exec(timeStr || '');
    if (!d || !t) return null;
    const start = new Date(+d[1], +d[2] - 1, +d[3], +t[1], +t[2], 0, 0);
    if (isNaN(start.getTime())) return null;
    const from = Math.floor(start.getTime() / 1000);
    return { from, to: from + hours * 3600 };
  }

  function historyStepSeconds(windowS) {
    if (windowS <= 7200) return 10;
    if (windowS <= 28800) return 30;
    return 60;
  }

  function createHistoryAssembler(id) {
    const fast = [], events = [], seen = new Set();
    let done = false, error = null, endSeq = null, stepS = null, mm = false;
    return {
      add(chunk) {
        if (!chunk || chunk.id !== id || done || typeof chunk.seq !== 'number') return false;
        if (seen.has(chunk.seq)) return false;
        seen.add(chunk.seq);
        if (chunk.kind === 'fast') {
          stepS = chunk.step_s; mm = !!chunk.mm;
          (chunk.rows || []).forEach(r => fast.push(r));
        } else if (chunk.kind === 'events') {
          (chunk.rows || []).forEach(r => events.push(r));
        } else if (chunk.kind === 'end') {
          done = true; error = chunk.error || null; endSeq = chunk.seq;
        }
        return true;
      },
      state() {
        let gap = false;
        if (done) for (let s = 0; s < endSeq; s++) if (!seen.has(s)) { gap = true; break; }
        return { done, error, gap, chunks: seen.size, stepS, mm };
      },
      rows() { return fast.slice().sort((a, b) => a[0] - b[0]); },
      events() {
        return events.slice().sort((a, b) => a[0] - b[0])
          .map(r => ({ t: r[0], tag: r[1], value: r[2], kind: r[3] }));
      },
    };
  }

  function historyColumns(rows, mm) {
    const sorted = rows.slice().sort((a, b) => a[0] - b[0]);
    const out = { x: [], step: [], cycle: [] };
    HIST_KEYS.forEach(k => { out[k] = { v: [], lo: [], hi: [] }; });
    sorted.forEach(r => {
      out.x.push(r[0]);
      HIST_KEYS.forEach((k, i) => {
        const cell = r[1 + i];
        let lo = null, hi = null;
        if (mm) { if (Array.isArray(cell)) { lo = cell[0]; hi = cell[1]; } }
        else if (typeof cell === 'number') { lo = hi = cell; }
        out[k].lo.push(lo); out[k].hi.push(hi);
        out[k].v.push(lo === null || hi === null ? null : (lo + hi) / 2);
      });
      out.step.push(r[6]); out.cycle.push(r[7]);
    });
    return out;
  }

  // liveRow is a plain row (values, not [min,max]). Returns a new array.
  function historyAppendLive(rows, mm, stepS, liveRow, windowS) {
    const out = rows.filter(r => r[0] > liveRow[0] - windowS);
    if (!mm) { out.push(liveRow.slice()); return out; }
    const start = liveRow[0] - (liveRow[0] % stepS);
    const last = out[out.length - 1];
    if (last && last[0] === start) {
      const merged = last.slice();
      for (let i = 1; i <= 5; i++) {
        const v = liveRow[i];
        if (typeof v !== 'number') continue;
        merged[i] = Array.isArray(merged[i]) ? [Math.min(merged[i][0], v), Math.max(merged[i][1], v)] : [v, v];
      }
      merged[6] = liveRow[6]; merged[7] = liveRow[7];
      out[out.length - 1] = merged;
    } else {
      const fresh = [start];
      for (let i = 1; i <= 5; i++) fresh.push(typeof liveRow[i] === 'number' ? [liveRow[i], liveRow[i]] : null);
      fresh.push(liveRow[6], liveRow[7]);
      out.push(fresh);
    }
    return out;
  }

  function telemetryToHistoryRow(t, nowMs) {
    const num = v => (typeof v === 'number' ? v : null);
    const no3 = typeof t.AIT01_NO3 === 'number' ? scaleTelemetryValue('AIT01_NO3', t.AIT01_NO3) : null;
    return [Math.floor(nowMs / 1000), num(t.LT01), num(t.LT02), no3, num(t.FT101_Flow_Lh), num(t.Dosing_Flow),
            num(t.Step), t.Cycle_Type === 1 ? 'L' : 'S'];
  }

  function historyEventText(ev) {
    switch (ev.kind) {
      case 'alert': return ev.value;
      case 'SP': return ev.tag + ' set to ' + ev.value;
      case 'B14': return 'Dosing mode set to ' + (ev.value === '1' ? 'auto' : 'manual');
      case 'sim': return ev.tag + ' changed to ' + ev.value + ' (simulated)';
      default: return ev.tag + ' changed to ' + ev.value;
    }
  }

  const HISTORY_ERRORS = {
    sd_missing: 'SD card missing on the PLC',
    clock_not_set: 'Clock not set on the PLC',
    bad_window: "That time window isn't valid",
    bad_request: 'The PLC rejected the request',
    ota_in_progress: 'The PLC is updating, try again shortly',
    sd_error: 'The PLC could not read its SD card',
    timeout: "PLC didn't respond",
    not_operator: 'Sign in as operator to load history',
    dash_not_connected: 'Not connected',
    cancelled: 'Interrupted by another view, reloading…',
  };
  function historyErrorText(code) { return HISTORY_ERRORS[code] || ('Failed: ' + code); }

  // True when a finished history job should be reloaded automatically
  // (same window as before) rather than just shown as failed: the PLC only
  // runs one history job at a time, so opening Trends and Alarms in quick
  // succession makes the firmware end whichever job was already running
  // with error "cancelled". That is expected, not an operator-facing
  // failure, so the page silently reloads instead of leaving a dead
  // "Failed: cancelled" status and a permanently-disabled live extension.
  // A job that is merely still in progress (state.done === false) is NOT
  // a reload case - that is handled by resuming its watchdog instead
  // (see index.html), so a legitimately slow load isn't restarted from
  // scratch just because the page was hidden and shown again.
  function historyNeedsReload(state) {
    return !!(state && state.done && state.error === 'cancelled');
  }

  // Whether a page's history job should still count as "busy" for the
  // purpose of holding another page back from starting a job of its own
  // (the PLC only runs one at a time). `busy` is the page's own flag (set
  // true when it starts a load, false when it ends for any reason);
  // `ageMs` is how long it's been since that job's last chunk arrived.
  // A silently dropped job (e.g. link loss, final review #2) never sets
  // `busy` false on its own while the page is hidden - its watchdog is
  // stopped - so without this staleness check `busy` alone could stay
  // true forever and block the other page's loads permanently. 10 s
  // matches the watchdog's own dead-job timeout.
  function historyStillBusy(busy, ageMs) {
    return !!busy && ageMs < 10000;
  }

  // Neutral grays by step (ISA-101: no alarm colours).
  const STEP_SHADES = { 100: '#b3b8bb', 102: '#e3e5e6', 104: '#c8cccd', 106: '#8f989c', 108: '#c8cccd', 110: '#6f787c' };
  function stepShade(step) { return STEP_SHADES[step] || '#d5d8d9'; }

  // Canned history for ?demo= (screenshots without a broker).
  function demoHistoryChunks(id, from, to, series) {
    const stepS = historyStepSeconds(to - from), mm = stepS > 10;
    const chunks = [];
    let seq = 0;
    if (series.indexOf('fast') >= 0) {
      let rows = [];
      for (let t = from - (from % stepS); t < to; t += stepS) {
        if (t < from) continue;
        const ph = (t % 3000) / 3000;
        const lt01 = Math.round(60 + 60 * Math.abs(Math.sin(Math.PI * ph)));
        const lt02 = Math.round(170 - lt01);
        const no3 = Math.round((40 + 4 * Math.sin(t / 5000)) * 10) / 10;
        const flow = 1800 + Math.round(40 * Math.sin(t / 700));
        const step = ph < 0.45 ? 106 : ph < 0.5 ? 104 : ph < 0.95 ? 110 : 108;
        const vals = [lt01, lt02, no3, flow, 350];
        const row = [t].concat(mm ? vals.map(v => [v - 1, v + 1]) : vals).concat([step, 'L']);
        if (t % 14400 < stepS) row[1] = null; // one sensor gap per 4 h
        rows.push(row);
        if (rows.length === 20) { chunks.push({ id, seq: seq++, kind: 'fast', step_s: stepS, mm, rows }); rows = []; }
      }
      if (rows.length) chunks.push({ id, seq: seq++, kind: 'fast', step_s: stepS, mm, rows });
    }
    if (series.indexOf('events') >= 0) {
      const span = to - from;
      chunks.push({ id, seq: seq++, kind: 'events', rows: [
        [from + Math.floor(span * 0.2), 'SP_L5', '75', 'SP'],
        [from + Math.floor(span * 0.5), 'ALERT', 'LT01_Low_level active', 'alert'],
        [from + Math.floor(span * 0.8), 'B14', '1', 'B14'],
      ] });
    }
    chunks.push({ id, seq: seq++, kind: 'end', done: true });
    return chunks;
  }

  // "Send Daily Email Now" for a chosen day (firmware v9 Email_Req_* points,
  // Hreg 190-192). 0/0/0 = yesterday. Date first, coil last: the firmware
  // latches the date when it sees the coil.
  function emailRequestWrites(dateStr) {
    let y = 0, m = 0, d = 0;
    if (dateStr) {
      const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
      if (!r) return null;
      y = +r[1]; m = +r[2]; d = +r[3];
    }
    return [{ point: 'Email_Req_Year', value: y }, { point: 'Email_Req_Month', value: m },
            { point: 'Email_Req_Day', value: d }, { point: 'Send_Daily_Email_Now', value: 1 }];
  }
  // Sent after the request is accepted, so a later send from the local touch
  // panel goes back to "yesterday" instead of reusing this date.
  function emailResetWrites() {
    return [{ point: 'Email_Req_Year', value: 0 }, { point: 'Email_Req_Month', value: 0 },
            { point: 'Email_Req_Day', value: 0 }];
  }
  // plc/<id>/debug line -> the daily-email result text, or null.
  // mqttDebugLog() prepends "[<unixtime>] " whenever the clock is valid (the
  // only case the send path ever runs under - see daily_email.cpp's "clock
  // not set" bail-out), so a real line looks like
  // "[1790000000] daily_email: ...". Strip that timestamp before checking
  // the prefix; bare (no-timestamp) lines still work too.
  function dailyEmailResultText(line) {
    if (typeof line !== 'string') return null;
    const rest = line.replace(/^\[\d+\]\s*/, '');
    const p = 'daily_email:';
    return rest.indexOf(p) === 0 ? rest.slice(p.length).trim() : null;
  }

  // ---- Instrument calibration (spec 2026-09-27-analog-calibration-design) ----
  // settings = {raw4, raw20, eng4, eng20} in REGISTER units as read from the
  // PLC; eng4/eng20 arguments and results are ENGINEERING units (cm, ppm).
  const CAL_INSTRUMENTS = [
    { tag: 'LT01', label: 'TAYA 1 level', unit: 'cm', decimals: 0, regScale: 1,
      raw4: 'SP_L1_4mA', raw20: 'SP_L1_20mA', eng4: 'SP_L1_Eng4', eng20: 'SP_L1_Eng20' },
    { tag: 'LT02', label: 'TAYA 2 level', unit: 'cm', decimals: 0, regScale: 1,
      raw4: 'SP_L2_4mA', raw20: 'SP_L2_20mA', eng4: 'SP_L2_Eng4', eng20: 'SP_L2_Eng20' },
    { tag: 'AIT01_NO3', label: 'NO3', unit: 'ppm', decimals: 1, regScale: 10,
      raw4: 'SP_N_4mA', raw20: 'SP_N_20mA', eng4: 'SP_N_Eng4', eng20: 'SP_N_Eng20' },
  ];
  const PROCESS_SETPOINTS = SETPOINTS.filter(s => s.group !== 'Calibration');

  function averageLast(values, n) {
    const last = values.slice(-n);
    if (last.length < n || last.some(v => typeof v !== 'number')) return null;
    return Math.round(last.reduce((a, b) => a + b, 0) / n * 1000) / 1000;
  }

  function roundTo(v, decimals) { const f = Math.pow(10, decimals + 2); return Math.round(v * f) / f; }

  // The register value that would actually be written for an engineering-unit
  // input (Math.round(v * regScale), with -0 normalized to 0 - see
  // validateRange). Shared so the confirm text always shows what will be
  // written, not a separately-rounded display value (2026-09-28 review fix).
  function engToRegister(v, inst) {
    const r = Math.round(v * inst.regScale);
    return r === 0 ? 0 : r;
  }

  function currentValueFromMilliamps(inst, mA, settings) {
    if (typeof mA !== 'number') return null;
    const e4 = settings.eng4 / inst.regScale, e20 = settings.eng20 / inst.regScale;
    return roundTo(e4 + (mA - 4) * (e20 - e4) / 16, inst.decimals);
  }

  function zeroAdjust(eng4, eng20, shown, actual) {
    const d = actual - shown;
    return { eng4: eng4 + d, eng20: eng20 + d };
  }

  function twoPointRange(p1, p2) {
    if (Math.abs(p2.mA - p1.mA) < 2) return { error: 'The two points must be at least 2 mA apart' };
    const slope = (p2.value - p1.value) / (p2.mA - p1.mA);
    return { eng4: roundTo(p1.value + (4 - p1.mA) * slope, 2), eng20: roundTo(p1.value + (20 - p1.mA) * slope, 2) };
  }

  // Refuses an electrical (raw ADC count) capture that would make the
  // Refuses an electrical (raw ADC count) capture that would make the
  // raw4/raw20 pair inverted or zero-width. `which` is 'raw4' or 'raw20' -
  // the end being captured now; `otherRaw` is the OTHER end's current
  // setting (unchanged by this capture). Final review item 5.
  function validateRawCapture(which, newRaw, otherRaw) {
    if (which === 'raw4') {
      if (!(otherRaw > newRaw)) return { ok: false, reason: 'The 4 mA count must be below the 20 mA count (' + otherRaw + ')' };
    } else {
      if (!(newRaw > otherRaw)) return { ok: false, reason: 'The 20 mA count must be above the 4 mA count (' + otherRaw + ')' };
    }
    return { ok: true };
  }

  // Validates a full electrical calibration pair (counts at 4 mA and 20 mA)
  // before applying them to the PLC.
  function validateElectrical(raw4, raw20) {
    if (typeof raw4 !== 'number' || typeof raw20 !== 'number' || isNaN(raw4) || isNaN(raw20)) {
      return { ok: false, reason: 'Enter whole numbers for counts' };
    }
    if (raw4 < 0 || raw4 > 4095 || raw20 < 0 || raw20 > 4095) {
      return { ok: false, reason: 'Allowed range 0–4095 counts' };
    }
    if (!(raw20 > raw4)) {
      return { ok: false, reason: 'The 20 mA count must be above the 4 mA count (' + raw4 + ')' };
    }
    return { ok: true };
  }

  function validateRange(inst, eng4, eng20) {
    if (!(eng20 > eng4)) return { ok: false, reason: 'The value at 20 mA must be above the value at 4 mA' };
    const r4 = engToRegister(eng4, inst), r20 = engToRegister(eng20, inst);
    const sp4 = SETPOINTS.find(s => s.name === inst.eng4), sp20 = SETPOINTS.find(s => s.name === inst.eng20);
    const fmt = v => (v / inst.regScale) + ' ' + inst.unit;
    if (r4 < sp4.min || r4 > sp4.max) return { ok: false, reason: 'The value at 4 mA must be between ' + fmt(sp4.min) + ' and ' + fmt(sp4.max) };
    if (r20 < sp20.min || r20 > sp20.max) return { ok: false, reason: 'The value at 20 mA must be between ' + fmt(sp20.min) + ' and ' + fmt(sp20.max) };
    return { ok: true, writes: [{ point: inst.eng4, value: r4 }, { point: inst.eng20, value: r20 }] };
  }

  function calibrationConfirmText(inst, settings, next, mA) {
    const f = v => Number(v.toFixed(inst.decimals));
    const old4 = settings.eng4 / inst.regScale, old20 = settings.eng20 / inst.regScale;
    // Show the value that will actually be written (same register rounding
    // as validateRange), not next.eng4/eng20 rounded separately - otherwise
    // the confirmation can show a different value than what gets sent.
    const newReg4 = engToRegister(next.eng4, inst), newReg20 = engToRegister(next.eng20, inst);
    const newEng4 = newReg4 / inst.regScale, newEng20 = newReg20 / inst.regScale;
    const now = currentValueFromMilliamps(inst, mA, settings);
    const after = currentValueFromMilliamps(inst, mA, { eng4: newReg4, eng20: newReg20 });
    let text = inst.label + ': value at 4 mA ' + f(old4) + ' → ' + f(newEng4) + ' ' + inst.unit +
      ', at 20 mA ' + f(old20) + ' → ' + f(newEng20) + ' ' + inst.unit + '.';
    if (now !== null) text += '\nIt will read ' + f(after) + ' ' + inst.unit + ' (now ' + f(now) + ' ' + inst.unit + ').';
    return text + '\nThe sequence uses the new value immediately.';
  }

  const HmiLogic = {
    FAULTS, decodeFaultBitmask, SETPOINTS, scaleTelemetryValue,
    packEmailToRegisters, unpackRegistersToEmail,
    STEP_NAMES, stepName, stepLabel, stepDescription,
    SIM_POINTS, simPointsFromMask, simEnableWrites, realValue, simValueText, simConfirmMessage,
    validateNumber, setpointDiff, pumpState, dosingText, batchOutcome, alarmSummary,
    createRing, sparklinePath, DEMO_FRAMES, describeBoot, sdCardStatus,
    historyWindow, historyWindowAt, historyStepSeconds, createHistoryAssembler, historyColumns,
    historyAppendLive, telemetryToHistoryRow, historyEventText, historyErrorText, historyNeedsReload, historyStillBusy, stepShade, demoHistoryChunks,
    emailRequestWrites, emailResetWrites, dailyEmailResultText,
    CAL_INSTRUMENTS, PROCESS_SETPOINTS, averageLast, currentValueFromMilliamps, zeroAdjust, twoPointRange, validateRange, validateRawCapture, validateElectrical, calibrationConfirmText,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HmiLogic;
  } else {
    root.HmiLogic = HmiLogic;
  }
})(typeof window !== 'undefined' ? window : this);
