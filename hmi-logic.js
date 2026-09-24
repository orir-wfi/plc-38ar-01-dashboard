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
  // "106-L" / "106-S" - B13 large/small. At 100/102 it's the NEXT half's type.
  function stepLabel(step, cycleIsLarge) {
    if (typeof step !== 'number') return '—';
    return step + '-' + (cycleIsLarge ? 'L' : 'S');
  }

  // Same order as the firmware's SIM_POINTS / *_Sim coils 17-23:
  // bit n of telemetry Sim_Mask = SIM_POINTS[n].
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
    SIM_POINTS.forEach((p, i) => { if ((mask >>> i) & 1) out.push(p.name); });
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
    System_Switch: 1, Reset_Inactive_Alarms: 0, Q_Stop: 1, P1_OL: 0, P2_OL: 0, P3_OL: 0,
    P4_OL: 0, P5_OL: 0, FT101_P: 0, LS0_low: 1, LT01: 104, LT02: 82, AIT01_NO3: 421,
    FT101_accumulated: 182, ActiveFaultCount: 0, FaultBitmask: 0, TAYA_Fault: 0,
    Inlet_Fault: 0, Sugar_Fault: 0, DP1_Fault: 0, P3_Fault: 0, Force_B14_Manual: 0,
    Emergency_Stop: 0, C_10: 7, C_11: 4, C_12: 3, C_13: 2.1, C_14: 1.9,
    Step: 106, Cycle_Type: 1, FT101_Flow_Lh: 1820, Dosing_Flow: 350, NO3_Inlet_Avg: 418,
    Inlet_Total_L: 125400, DP1_Total_Strokes: 88210, Sim_Mask: 0,
    ActiveTransport: 1, WiFi_Connected: 1, WiFi_RSSI: -61,
  };
  const DEMO_FRAMES = {
    normal: Object.assign({}, DEMO_BASE),
    alarm: Object.assign({}, DEMO_BASE, {
      Step: 102, Cycle_Type: 0, ActiveFaultCount: 3, TAYA_Fault: 1,
      FaultBitmask: (1 << 1) | (1 << 9) | (1 << 17), LT01: 168, AIT01_NO3: 38,
    }),
    sim: Object.assign({}, DEMO_BASE, {
      Sim_Mask: (1 << 2) | (1 << 4), LT01: 120, LT01_Raw: 85, LS0_low: 1, LS0_low_Raw: 0,
    }),
  };

  const HmiLogic = {
    FAULTS, decodeFaultBitmask, SETPOINTS, scaleTelemetryValue,
    packEmailToRegisters, unpackRegistersToEmail,
    STEP_NAMES, stepName, stepLabel,
    SIM_POINTS, simPointsFromMask, simEnableWrites, realValue, simValueText, simConfirmMessage,
    validateNumber, setpointDiff, pumpState, dosingText, batchOutcome, alarmSummary,
    createRing, sparklinePath, DEMO_FRAMES,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HmiLogic;
  } else {
    root.HmiLogic = HmiLogic;
  }
})(typeof window !== 'undefined' ? window : this);
