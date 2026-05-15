export default class MadgwickAHRS {
  constructor(options = {}) {
    this.sampleFreq = options.sampleInterval
      ? 1000 / options.sampleInterval
      : 512;
    this.beta = options.beta || 0.1;

    this.q0 = 1;
    this.q1 = 0;
    this.q2 = 0;
    this.q3 = 0;

    this.lastUpdate = Date.now();
  }

  updateIMU(gx, gy, gz, ax, ay, az) {
    const now = Date.now();
    const deltaT = (now - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = now;

    let q0 = this.q0,
      q1 = this.q1,
      q2 = this.q2,
      q3 = this.q3;

    // Convert gyroscope degrees/sec to radians/sec
    gx *= Math.PI / 180;
    gy *= Math.PI / 180;
    gz *= Math.PI / 180;

    // Normalize accelerometer measurement
    let norm = Math.sqrt(ax * ax + ay * ay + az * az);
    if (norm === 0) return;
    ax /= norm;
    ay /= norm;
    az /= norm;

    const _2q0 = 2 * q0;
    const _2q1 = 2 * q1;
    const _2q2 = 2 * q2;
    const _2q3 = 2 * q3;
    const _4q0 = 4 * q0;
    const _4q1 = 4 * q1;
    const _4q2 = 4 * q2;
    const _8q1 = 8 * q1;
    const _8q2 = 8 * q2;
    const q0q0 = q0 * q0;
    const q1q1 = q1 * q1;
    const q2q2 = q2 * q2;
    const q3q3 = q3 * q3;

    const s0 = _4q0 * q2q2 + _2q2 * ax + _4q0 * q1q1 - _2q1 * ay;
    const s1 =
      _4q1 * q3q3 -
      _2q3 * ax +
      4 * q0q0 * q1 -
      _2q0 * ay -
      _4q1 +
      _8q1 * q1q1 +
      _8q1 * q2q2 +
      _4q1 * az;
    const s2 =
      4 * q0q0 * q2 +
      _2q0 * ax +
      _4q2 * q3q3 -
      _2q3 * ay -
      _4q2 +
      _8q2 * q1q1 +
      _8q2 * q2q2 +
      _4q2 * az;
    const s3 = 4 * q1q1 * q3 - _2q1 * ax + 4 * q2q2 * q3 - _2q2 * ay;

    const recipNorm = 1 / Math.sqrt(s0 * s0 + s1 * s1 + s2 * s2 + s3 * s3);
    const beta = this.beta;

    // Gradient descent step
    this.q0 += -beta * s0 * deltaT;
    this.q1 += -beta * s1 * deltaT;
    this.q2 += -beta * s2 * deltaT;
    this.q3 += -beta * s3 * deltaT;

    // Integrate rate of change of quaternion
    const qDot0 = 0.5 * (-q1 * gx - q2 * gy - q3 * gz);
    const qDot1 = 0.5 * (q0 * gx + q2 * gz - q3 * gy);
    const qDot2 = 0.5 * (q0 * gy - q1 * gz + q3 * gx);
    const qDot3 = 0.5 * (q0 * gz + q1 * gy - q2 * gx);

    this.q0 += qDot0 * deltaT;
    this.q1 += qDot1 * deltaT;
    this.q2 += qDot2 * deltaT;
    this.q3 += qDot3 * deltaT;

    // Normalize quaternion
    const normQ =
      1 /
      Math.sqrt(
        this.q0 * this.q0 +
          this.q1 * this.q1 +
          this.q2 * this.q2 +
          this.q3 * this.q3
      );
    this.q0 *= normQ;
    this.q1 *= normQ;
    this.q2 *= normQ;
    this.q3 *= normQ;
  }
}
