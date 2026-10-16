/**
 * Hero Interactive Canvas Animation
 * Particle network, mouse trail & ripples
 */
(function (window) {
  'use strict';

      /* ================= INTERACTIVE HERO CANVAS ANIMATION ================= */
      (function initInteractiveHeroCanvas() {
        var canvas = document.getElementById('heroInteractiveCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        var w, h;
        var particles = [];
        var mouse = { x: -9999, y: -9999, active: false, radius: 180 };
        var ripples = [];

        function resize() {
          w = canvas.width = window.innerWidth;
          h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        var count = Math.min(85, Math.max(48, Math.floor((w * h) / 17000)));
        for (var i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.7,
            vy: (Math.random() - 0.5) * 0.7,
            r: Math.random() * 2.2 + 1.2,
            baseColor: Math.random() > 0.35 ? 'rgba(120, 200, 255,' : (Math.random() > 0.5 ? 'rgba(255, 215, 80,' : 'rgba(255, 255, 255,'),
            alpha: Math.random() * 0.45 + 0.35,
            pulse: Math.random() * Math.PI * 2
          });
        }

        window.addEventListener('mousemove', function (e) {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
          mouse.active = true;
        });
        window.addEventListener('mouseleave', function () {
          mouse.active = false;
          mouse.x = -9999;
          mouse.y = -9999;
        });
        window.addEventListener('click', function (e) {
          ripples.push({ x: e.clientX, y: e.clientY, r: 6, maxR: 130, alpha: 0.85 });
        });

        function draw() {
          ctx.clearRect(0, 0, w, h);

          // Ambient mouse aura
          if (mouse.active && mouse.x > 0 && mouse.y > 0) {
            var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius);
            g.addColorStop(0, 'rgba(80, 180, 255, 0.22)');
            g.addColorStop(0.5, 'rgba(40, 140, 240, 0.08)');
            g.addColorStop(1, 'rgba(40, 110, 230, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Expanding ripples
          for (var ri = ripples.length - 1; ri >= 0; ri--) {
            var rip = ripples[ri];
            rip.r += 3.4;
            rip.alpha -= 0.022;
            if (rip.alpha <= 0 || rip.r >= rip.maxR) {
              ripples.splice(ri, 1);
              continue;
            }
            ctx.strokeStyle = 'rgba(255, 220, 100, ' + rip.alpha + ')';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
            ctx.stroke();
          }

          // Particles loop
          for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulse += 0.025;

            if (p.x < -10) p.x = w + 10;
            else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10;
            else if (p.y > h + 10) p.y = -10;

            // Mouse attraction & connection
            if (mouse.active) {
              var dx = mouse.x - p.x;
              var dy = mouse.y - p.y;
              var dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < mouse.radius && dist > 1) {
                var force = (1 - dist / mouse.radius) * 0.04;
                p.x += dx * force;
                p.y += dy * force;

                var lineAlpha = (1 - dist / mouse.radius) * 0.7;
                ctx.strokeStyle = 'rgba(140, 225, 255, ' + lineAlpha + ')';
                ctx.lineWidth = (1 - dist / mouse.radius) * 1.8 + 0.4;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
              }
            }

            var curAlpha = p.alpha + Math.sin(p.pulse) * 0.15;
            ctx.fillStyle = p.baseColor + Math.max(0.12, curAlpha) + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            // Neighbors connection
            for (var j = i + 1; j < particles.length; j++) {
              var p2 = particles[j];
              var dxx = p.x - p2.x;
              var dyy = p.y - p2.y;
              var d2 = Math.sqrt(dxx * dxx + dyy * dyy);
              if (d2 < 120) {
                var connAlpha = (1 - d2 / 120) * 0.24;
                ctx.strokeStyle = 'rgba(110, 190, 255, ' + connAlpha + ')';
                ctx.lineWidth = 0.85;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
          }

        }

        var isRunning = false;
        var animId = null;

        function loop() {
          if (!isRunning) return;
          draw();
          animId = requestAnimationFrame(loop);
        }

        window._stopHeroCanvas = function () {
          isRunning = false;
          if (animId) cancelAnimationFrame(animId);
          animId = null;
        };

        window._startHeroCanvas = function () {
          if (!isRunning) {
            isRunning = true;
            animId = requestAnimationFrame(loop);
          }
        };

        // Khoi chay canvas ngay lap tuc
        window._startHeroCanvas();
      })();
})(window);
