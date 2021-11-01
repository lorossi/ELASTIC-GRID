class Sketch extends Engine {
  preload() {
    // distance between circles
    this._scl = 30;
    // radius of circles
    this._r = 7;
    // time related variables
    this._omega = 1;
    this._duration = 250;
    this._recording = false;
  }

  setup() {
    // color aberration
    this._circle_colors = [{
        color: new Color(255, 0, 255),
        d_pos: {
          x: this._r / 2,
          y: -this._r / 2,
        },
      },
      {
        color: new Color(255, 255, 0),
        d_pos: {
          x: -this._r / 2,
          y: -this._r / 2,
        },
      },
      {
        color: new Color(0, 0, 255),
        d_pos: {
          x: 0,
          y: -this._r,
        },
      },
      {
        color: new Color(220, 220, 220),
        d_pos: {
          x: 0,
          y: 0
        },
      }
    ];
    this._background = new Color(15, 15, 15);
    // setup capturer
    this._capturer_started = false;
    if (this._recording) {
      this._capturer = new CCapture({
        format: "png"
      });
    }
  }

  draw() {
    // start capturer
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    // time variables calculation
    const percent = (this.frameCount % this._duration) / this._duration;
    const time_theta = percent * Math.PI * 2;

    // clear background
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = "screen";

    // draw each circle
    for (let x = -this._scl; x <= this.width + this._scl; x += this._scl) {
      const width_ratio = x / this.width;
      const theta = width_ratio * Math.PI * 2 * 4;
      for (let y = -this._scl; y <= this.height + this._scl; y += this._scl) {
        const height_ratio = y / this.height;
        const phi = height_ratio * Math.PI * 2 * 4;

        // calculate displacement

        const dx = Math.cos(phi) * Math.cos(theta) * this._r * Math.sin(time_theta * this._omega);
        const dy = Math.sin(phi) * Math.sin(theta) * this._r * Math.cos(time_theta * this._omega);

        const dr = Math.cos(phi + Math.PI) * Math.cos(theta + Math.PI) * this._r * 0.5;
        const da = (dx * dx + dy * dy) / (this._r * this._r) * 1.25;

        this.ctx.save();
        this.ctx.translate(x + dx, y + dy);

        for (let i = 0; i < this._circle_colors.length; i++) {
          const current_color = this._circle_colors[i];

          this.ctx.save();
          this.ctx.translate(current_color.d_pos.x * da, current_color.d_pos.y * da);
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
      if (this.frameCount < this._duration) {
        this._capturer.capture(this._canvas);
        if (this.frameCount % 30 == 0) {
          const update = `Record: ${parseInt(percent * 100)}%`;
          console.log(`%c ${update}`, "color: yellow; font-size: 0.75rem");
        }
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }
  }
}