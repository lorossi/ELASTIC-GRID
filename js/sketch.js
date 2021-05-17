class Sketch extends Engine {
  preload() {
    this._scl = 25;
    this._r = 6;
    this._omega = 10;
    this._duration = 600;
    this._recording = false;
  }

  setup() {
    // color and aberration
    this._circle_colors = [
      {
        color: new Color(255, 0, 0),
        dpos: { x: 3, y: 0 },
      },
      {
        color: new Color(255, 255, 0),
        dpos: { x: -3, y: 0 },
      },
      {
        color: new Color(0, 0, 255),
        dpos: { x: 0, y: 3 },
      },
      {
        color: new Color(200, 200, 200),
        dpos: { x: 0, y: 0 },
      }
    ];
    this._background = new Color(15, 15, 15);
    // setup capturer
    this._capturer_started = false;
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
    }
  }

  draw() {
    // start capturer
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    const percent = (this.frameCount % this._duration) / this._duration;
    const time_theta = percent * Math.PI * 2;

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = "screen";

    for (let y = -this._scl; y <= this.height + this._scl; y += this._scl) {
      const height_ratio = y / this.height;
      for (let x = -this._scl; x <= this.width + this._scl; x += this._scl) {
        const width_ratio = x / this.width;

        this.ctx.save();
        const phi = height_ratio * Math.PI * 2 * 4;
        const theta = width_ratio * Math.PI * 2 * 4;
        const dx = Math.cos(phi) * Math.cos(theta) * this._r * Math.sin(time_theta * this._omega);
        const dy = Math.sin(phi) * Math.sin(theta) * this._r * Math.cos(time_theta * this._omega);

        const dr = Math.cos(phi + Math.PI) * Math.cos(theta + Math.PI) * this._r * 0.5;
        const da = (dx * dx + dy * dy) / (this._r * this._r) * 1.25;

        this.ctx.translate(x + dx, y + dy);

        for (let i = 0; i < this._circle_colors.length; i++) {
          const current_color = this._circle_colors[i];

          this.ctx.save();
          this.ctx.translate(current_color.dpos.x * da, current_color.dpos.y * da);
          this.ctx.fillStyle = current_color.color.rgb;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, this._r + dr, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }

        this.ctx.restore();
      }
    }

    this.ctx.restore();

    // handle recording
    if (this._recording) {
      if (this.frameCount % 30 == 0) {
        this._update = `Record: ${parseInt(percent * 100)}%`;
        console.log(`%c ${update}`, "color: yellow; font-size: 0.75rem");
      }
      if (this.frameCount < this._duration) {
        this._capturer.capture(this._canvas);
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }
  }
}