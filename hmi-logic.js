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
    { name: 'SP_N1', group: 'Concentration & dosing', label: 'Low nitrate Alert', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N2', group: 'Concentration & dosing', label: 'High nitrate Alert', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N3', group: 'Concentration & dosing', label: 'Desired NO3 Concentration', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N4', group: 'Concentration & dosing', label: 'SP_N3 dosing-loop deadband', unit: 'ppm', min: 0, max: 100 },
    { name: 'SP_N5', group: 'Concentration & dosing', label: 'Auto dosing start/resume threshold', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_N6', group: 'Concentration & dosing', label: 'Auto dosing stop threshold', unit: 'ppm', min: 0, max: 1000 },
    { name: 'SP_F01', group: 'Concentration & dosing', label: 'Manual Dosing pump Flow', unit: 'ml/hr', min: 0, max: 2280 },
    { name: 'SP_F02', group: 'Concentration & dosing', label: 'NO3 Dosing pump Flow', unit: 'ml/hr', min: 0, max: 2280 },
    { name: 'SP_F03', group: 'Concentration & dosing', label: 'Dosing pump change step', unit: 'ml/hr', min: 0, max: 100 },
    { name: 'SP_F04', group: 'Concentration & dosing', label: 'Dosing pump stroke length', unit: '%', min: 0, max: 100 },
    { name: 'T_11', group: 'Timers', label: 'P1 On Timer (max run time)', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_12', group: 'Timers', label: 'P2 On Timer (max run time)', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_13', group: 'Timers', label: 'Timer Half cycle large', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_14', group: 'Timers', label: 'Timer Half cycle small', unit: 'sec', min: 0, max: 86400 },
    { name: 'T_15', group: 'Timers', label: 'Time to change SP_F02', unit: 'min', min: 0, max: 65535 },
    { name: 'T_16', group: 'Timers', label: 'Step Timer', unit: 'sec', min: 0, max: 86400 },
    { name: 'SP_L1_4mA', group: '4-20mA calibration', label: 'LT01 raw ADC at 4mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L1_20mA', group: '4-20mA calibration', label: 'LT01 raw ADC at 20mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L2_4mA', group: '4-20mA calibration', label: 'LT02 raw ADC at 4mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_L2_20mA', group: '4-20mA calibration', label: 'LT02 raw ADC at 20mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_N_4mA', group: '4-20mA calibration', label: 'AIT01_NO3 raw ADC at 4mA', unit: 'counts', min: 0, max: 4095 },
    { name: 'SP_N_20mA', group: '4-20mA calibration', label: 'AIT01_NO3 raw ADC at 20mA', unit: 'counts', min: 0, max: 4095 },
  ];

  // Telemetry (mqtt_client.cpp's publishTelemetry()) fixed-point scaling.
  // LT01/LT02 are already in cm (analog_reader.cpp's getScaledAnalogRegister
  // only multiplies AIT01_NO3 by 10). FT101_accumulated is reported x100.
  const SCALE_DIVISORS = { AIT01_NO3: 10, FT101_accumulated: 100 };
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

  const HmiLogic = {
    FAULTS, decodeFaultBitmask, SETPOINTS, scaleTelemetryValue,
    packEmailToRegisters, unpackRegistersToEmail,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HmiLogic;
  } else {
    root.HmiLogic = HmiLogic;
  }
})(typeof window !== 'undefined' ? window : this);
