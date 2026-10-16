/**
 * Main Application Controller
 * State, Router, Form & Preview Renderer, Settings and Admin
 * Trung tam Cung ung Dich vu cong phuong Dong Hung Thuan
 */
(function (window, document) {
  'use strict';

      /* ================= settings (office name / place) — device-local only ================= */
      var settings = { office: '', place: '' };
      try {
        var raw = localStorage.getItem('tk_settings');
        if (raw) settings = Object.assign(settings, JSON.parse(raw));
      } catch (e) { }
      var DEFAULT_OFFICE = 'Ủy ban nhân dân Phường Đông Hưng Thuận';
      if (!settings.office) settings.office = DEFAULT_OFFICE;
      var DEFAULT_PLACE = 'Phường Đông Hưng Thuận, TP. Hồ Chí Minh';
      if (!settings.place) settings.place = DEFAULT_PLACE;
      function saveSettings() {
        try { localStorage.setItem('tk_settings', JSON.stringify(settings)); } catch (e) { }
      }
      function refreshOfficeLabel() {
        var el = document.getElementById('officeLabel');
        el.textContent = 'Tờ khai hộ tịch điện tử' + (settings.office ? (' · Kính gửi: ' + settings.office) : '');
      }


      /* ================= voice input (speech-to-text) ================= */
      var MIC_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
      var SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition || null;
      var activeRecognition = null;
      var activeMicBtn = null;

      function stopActiveRecognition() {
        if (activeRecognition) { try { activeRecognition.stop(); } catch (e) { } }
        if (activeMicBtn) { activeMicBtn.classList.remove('listening'); }
        activeRecognition = null; activeMicBtn = null;
      }

      function showToast(msg) {
        var t = document.getElementById('tkToast');
        if (!t) { t = document.createElement('div'); t.id = 'tkToast'; t.className = 'tk-toast'; document.body.appendChild(t); }
        t.textContent = msg; t.classList.add('show');
        clearTimeout(showToast._t); showToast._t = setTimeout(function () { t.classList.remove('show'); }, 6000);
      }
      // khi trình duyệt/ứng dụng không cho dùng micro (VD: mở trong ứng dụng Claude trên iPhone):
      // đưa con trỏ vào ô nhập để dùng nút micro có sẵn trên bàn phím điện thoại
      function micFallback(target) {
        try { target.focus(); } catch (e) { }
        var mobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
        showToast(mobile
          ? 'Ứng dụng này không cho dùng micro của trang. Hãy bấm biểu tượng 🎙 trên bàn phím điện thoại để đọc vào ô đang chọn.'
          : 'Trình duyệt chưa cho phép micro. Bấm biểu tượng ổ khóa/“Tệp” cạnh thanh địa chỉ → cho phép Micrô, rồi thử lại.');
      }
      function setupVoiceInputs(scope) {
        var buttons = scope.querySelectorAll('.micbtn');
        if (!SpeechRecognitionAPI) {
          buttons.forEach(function (btn) {
            btn.disabled = true;
            btn.title = 'Trình duyệt này chưa hỗ trợ nhập bằng giọng nói (thử Chrome/Edge và cần có mạng)';
          });
          return;
        }
        buttons.forEach(function (btn) {
          btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-mic-target');
            var target = document.getElementById(targetId);
            if (!target) return;

            if (activeMicBtn === btn) { stopActiveRecognition(); return; }
            stopActiveRecognition();

            var rec = new SpeechRecognitionAPI();
            rec.lang = 'vi-VN';
            rec.interimResults = false;
            rec.maxAlternatives = 1;
            activeRecognition = rec;
            activeMicBtn = btn;
            btn.classList.add('listening');

            rec.onresult = function (ev) {
              var transcript = ev.results[0][0].transcript.trim();
              if (transcript) {
                var sep = target.value && !/[\s.,;:]$/.test(target.value) ? ' ' : '';
                target.value = (target.value + sep + transcript).trim();
                target.dispatchEvent(new Event('input', { bubbles: true }));
              }
            };
            rec.onerror = function (ev) {
              if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed' || ev.error === 'audio-capture') {
                micFallback(target);
              } else if (ev.error === 'network') {
                showToast('Nhập bằng giọng nói cần có kết nối mạng. Có thể dùng nút micro trên bàn phím điện thoại.');
                try { target.focus(); } catch (e) { }
              }
            };
            rec.onend = function () {
              btn.classList.remove('listening');
              if (activeMicBtn === btn) { activeRecognition = null; activeMicBtn = null; }
            };
            try { rec.start(); } catch (e) { btn.classList.remove('listening'); }
          });
        });
      }


      /* ================= app state ================= */
      var state = { screen: 'select', formId: null, values: {}, sigDataUrls: {} };

      function todayIso() {
        var d = new Date();
        var m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
        return d.getFullYear() + '-' + m + '-' + day;
      }
      function getForm(id) { for (var i = 0; i < FORMS.length; i++) if (FORMS[i].id === id) return FORMS[i]; return null; }


      var GRP_HEAD_ICON = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M9 12h6M9 16h4" stroke-linecap="round"/></svg>';
      var CHEV_UP = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>';
      var openGroup = -1;

      function setOpenGroup(gi) {
        openGroup = gi;
        document.querySelectorAll('.cat-card').forEach(function (c) { c.classList.toggle('open', +c.getAttribute('data-gi') === gi); c.setAttribute('aria-expanded', +c.getAttribute('data-gi') === gi); });
        document.querySelectorAll('.group-card').forEach(function (p) { p.classList.toggle('open', +p.getAttribute('data-gi') === gi); });
        document.querySelector('.sel').classList.toggle('has-open', gi >= 0);
        if (gi >= 0) {
          var panel = document.querySelector('.group-card[data-gi="' + gi + '"]');
          if (panel && panel.getBoundingClientRect().bottom > window.innerHeight) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }

      function formCardHtml(f) {
        var d = DOMAIN_BY_ID[domainOf(f)] || {};
        var keys = (f.title + ' ' + (SHORT_TITLES[f.id] || '') + ' ' + (f.group || '') + ' ' + (d.name || '') + ' ' + (d.full || '')).toLowerCase();
        return '<button class="form-card" data-id="' + f.id + '" title="' + esc(f.title) + '" data-search="' + esc(keys) + '">' +
          '<span class="num">' + f.num + '</span><span class="ttl">' + esc(f.title) + '</span>' +
          CHEV_F.replace('width="16" height="16"', 'width="22" height="22"') + '</button>';
      }

      function renderCards() {
        var cHost = document.getElementById('quickGrid');
        var pHost = document.getElementById('cardGroups');
        var cards = '', panels = '';
        DOMAINS.forEach(function (d, gi) {
          var items = FORMS.filter(function (f) { return domainOf(f) === d.id; });
          if (!items.length) return;

          cards += '<button class="cat-card ' + d.cls + '" type="button" data-gi="' + gi + '" aria-expanded="false" title="' + esc(d.full || d.name) + '">' +
            '<span class="ci">' + d.icon + '</span>' +
            '<span class="cbody"><span><span class="ct">' + esc(d.name) + '</span>' +
            '<span class="cs"><span class="n">' + items.length + ' thủ tục</span><span class="o">Nhấn để xem chi tiết</span></span></span></span></button>';

          // thân panel: mảng nhiều nhóm con (Hộ tịch) thì chia theo nhóm, còn lại là danh sách phẳng
          var body = '';
          if (d.groups.length > 1) {
            d.groups.forEach(function (g) {
              var sub = items.filter(function (f) { return f.group === g; });
              if (!sub.length) return;
              var i = g.indexOf('(');
              var nm = i === -1 ? g : g.slice(0, i).trim();
              var note = i === -1 ? '' : '<small>(' + esc(g.slice(i + 1).replace(/\)$/, '')) + ')</small>';
              body += '<div class="grp-sub">' + esc(nm) + note + '</div>' + sub.map(formCardHtml).join('');
            });
          } else {
            body = items.map(formCardHtml).join('');
          }

          panels += '<div class="group-card" data-gi="' + gi + '" data-domain="' + d.id + '">' +
            '<div class="grp-head" title="Thu gọn"><span class="gicon" style="background:' + d.bg + '">' + GRP_HEAD_ICON + '</span>' +
            '<span class="gttl">Danh sách thủ tục – ' + esc(d.full || d.name) + '</span>' +
            '<span class="grp-count">' + items.length + ' thủ tục ' + CHEV_UP + '</span></div>' +
            '<div class="card-grid">' + body + '</div></div>';
        });
        cHost.innerHTML = cards;
        pHost.innerHTML = panels;

        cHost.querySelectorAll('.cat-card').forEach(function (c) {
          c.addEventListener('click', function () { var gi = +c.getAttribute('data-gi'); setOpenGroup(openGroup === gi ? -1 : gi); });
        });
        pHost.querySelectorAll('.grp-head').forEach(function (h) { h.addEventListener('click', function () { if (!document.querySelector('.sel').classList.contains('searching')) setOpenGroup(-1); }); });
        pHost.querySelectorAll('.form-card').forEach(function (btn) {
          btn.addEventListener('click', function () { selectForm(btn.getAttribute('data-id')); });
        });
      }

      function applySearch() {
        var q = document.getElementById('searchInput').value.trim().toLowerCase();
        var sel = document.querySelector('.sel');
        var noResults = document.getElementById('noResults');
        sel.classList.toggle('searching', !!q);
        if (!q) {
          noResults.hidden = true;
          document.querySelectorAll('.form-card, .group-card').forEach(function (c) { c.classList.remove('hidden'); });
          return;
        }
        var anyMatch = false;
        document.querySelectorAll('.group-card').forEach(function (g) {
          var n = 0;
          g.querySelectorAll('.form-card').forEach(function (c) {
            var match = c.getAttribute('data-search').indexOf(q) !== -1;
            c.classList.toggle('hidden', !match);
            if (match) { n++; anyMatch = true; }
          });
          g.classList.toggle('hidden', n === 0);
        });
        noResults.hidden = anyMatch;
      }


      /* ================= render: steps bar ================= */
      function renderSteps() {
        var bar = document.getElementById('stepsBar');
        var order = [['select', '1. Chọn loại giấy tờ'], ['form', '2. Nhập thông tin'], ['preview', '3. Xem lại & in']];
        bar.style.display = state.screen === 'admin' ? 'none' : '';
        var idx = order.findIndex(function (o) { return o[0] === state.screen; });
        bar.innerHTML = order.map(function (o, i) {
          var cls = 'step' + (i === idx ? ' active' : (i < idx ? ' done' : ''));
          return '<span class="' + cls + '">' + o[1] + '</span>' + (i < order.length - 1 ? '<span class="step-sep">›</span>' : '');
        }).join('');
      }


      /* ================= screen switching ================= */
      function showScreen(name) {
        stopActiveRecognition();
        state.screen = name;
        document.body.classList.toggle('on-select', name === 'select');
        if (name === 'select') {
          if (typeof fitSelect === 'function') setTimeout(fitSelect, 0);
          if (window._startHeroCanvas) window._startHeroCanvas();
        } else {
          if (window._stopHeroCanvas) window._stopHeroCanvas();
        }
        ['select', 'form', 'preview', 'admin'].forEach(function (s) {
          document.getElementById('screen-' + s).classList.toggle('active', s === name);
        });
        renderSteps();
        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      }

      function selectForm(id) {
        var form = getForm(id);
        if (!form) return;
        state.formId = id;
        state.values = {};
        // defaults
        form.fields.forEach(function (f) {
          if (f.section) return;
          if (f.default === 'today') state.values[f.key] = todayIso();
          else if (f.default) state.values[f.key] = f.default;
          else if (f.stdOffice) state.values[f.key] = settings.office || '';
          else if (f.stdPlace) state.values[f.key] = settings.place || '';
          else if (f.stdDate) { var dd = new Date(); state.values[f.key] = String(f.stdDate === 'ngày' ? dd.getDate() : f.stdDate === 'tháng' ? dd.getMonth() + 1 : dd.getFullYear()); }
          else if (/^Quốc tịch/i.test(f.label) && (f.type === 'text' || !f.type)) state.values[f.key] = 'Việt Nam';   // đa số là Việt Nam, ai khác thì sửa/đọc lại
        });
        // thông tin người khai đã nhập ở tờ khai trước → tự điền sẵn
        form.fields.forEach(function (f) {
          if (f.section || !f.std) return;
          var p = profile[f.std];
          if (p !== undefined && String(p).trim() !== '') state.values[f.key] = p;
        });
        if (!state.values.noiLap && settings.place) state.values.noiLap = settings.place;
        if (settings.office) state.values.coQuan = settings.office;
        renderFormScreen();
        showScreen('form');
      }


      /* ================= render: data entry form ================= */
      function fieldHtml(f) {
        // Giấy tờ tùy thân: tách thành 2 ô — số giấy tờ và ngày cấp
        if (f.type === 'text' && /^Giấy tờ tùy thân$/i.test(f.label) && !f._split) {
          return fieldHtml({ key: f.key, label: 'Số giấy tờ tùy thân', note: f.note, type: 'text', _split: true, placeholder: 'Số CCCD (12 số) hoặc số hộ chiếu' }) +
            fieldHtml({ key: f.key + '_ngayCap', label: 'Ngày cấp', type: 'date', _split: true });
        }
        var id = 'f_' + f.key;
        var val = state.values[f.key] || '';
        var wideClass = f.wide ? ' wide' : '';
        var noteHtml = f.note ? ' <span class="note">(' + f.note + ')</span>' : '';
        var inner = '';
        var micHtml = '<button type="button" class="micbtn" data-mic-target="' + id + '" title="Nhập bằng giọng nói" aria-label="Nhập bằng giọng nói">' + MIC_ICON + '</button>';
        if (f.type === 'textarea') {
          inner = '<div class="inputmic"><textarea id="' + id + '" data-key="' + f.key + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(val) + '</textarea>' + micHtml + '</div>';
        } else if (f.type === 'date') {
          inner = '<input type="date" id="' + id + '" data-key="' + f.key + '" value="' + esc(val) + '">';
        } else if (f.type === 'month') {
          inner = '<input type="month" id="' + id + '" data-key="' + f.key + '" value="' + esc(val) + '">';
        } else if (f.type === 'number') {
          inner = '<input type="number" min="0" id="' + id + '" data-key="' + f.key + '" value="' + esc(val) + '">';
        } else if (f.type === 'radio') {
          inner = '<div class="radiorow">' + f.options.map(function (o, i) {
            var checked = (val === o) ? ' checked' : '';
            return '<label><input type="radio" name="' + f.key + '" value="' + esc(o) + '" data-key="' + f.key + '"' + checked + '> ' + esc(o) + '</label>';
          }).join('') + '</div>';
        } else if (f.type === 'select') {
          inner = '<select id="' + id + '" data-key="' + f.key + '">' +
            '<option value=""' + (val ? '' : ' selected') + '>— Chọn —</option>' +
            f.options.map(function (o) { return '<option value="' + esc(o) + '"' + (val === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') +
            '</select>';
        } else if (f.type === 'check') {
          return '<div class="field wide checkfield"><label class="checkline"><input type="checkbox" id="' + id + '" data-key="' + f.key + '"' + (val ? ' checked' : '') + '> <span>' + esc(f.label) + '</span></label>' +
            (f.hint ? '<div class="fhint">' + esc(f.hint) + '</div>' : '') + '</div>';
        } else if (f.type === 'copy') {
          // nút chép nguyên thông tin từ mục khác sang, đỡ phải gõ lại
          return '<div class="field wide"><button type="button" class="copybtn" data-copy="' + esc(JSON.stringify(f.copy)) + '">' +
            '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> ' +
            esc(f.label) + '</button>' + (f.hint ? '<div class="fhint">' + esc(f.hint) + '</div>' : '') + '</div>';
        } else if (f.type === 'nganh') {
          // ô tra ngành, nghề: gõ vài chữ để lọc, bấm một dòng là điền cả tên ngành lẫn mã ngành
          return '<div class="field wide nganhfield"><label for="' + id + '">' + esc(f.label) + noteHtml + '</label>' +
            '<div class="nganhbox"><div class="inputmic">' +
            '<input type="text" id="' + id + '" data-key="' + f.key + '" data-nganh="' + esc(f.maKey || '') + '" autocomplete="off" ' +
            'placeholder="' + esc(f.placeholder || 'Gõ vài chữ để tìm, VD: tạp hóa, quán ăn, cắt tóc…') + '" value="' + esc(val) + '">' +
            micHtml + '</div><div class="nganhlist" hidden></div></div>' +
            (f.hint ? '<div class="fhint">' + esc(f.hint) + '</div>' : '') + '</div>';
        } else {
          var listAttr = (f.suggest && SUGGEST[f.suggest]) ? ' list="dl_' + f.suggest + '"' : '';
          inner = '<div class="inputmic"><input type="text" id="' + id + '" data-key="' + f.key + '"' + listAttr + ' placeholder="' + esc(f.placeholder || '') + '" value="' + esc(val) + '">' + micHtml + '</div>';
        }
        var hintHtml = f.hint ? '<div class="fhint">' + esc(f.hint) + '</div>' : '';
        var stdMark = (f.std && PROFILE_LABEL[f.std]) ? ' <span class="stdtag" title="Thông tin này dùng chung cho mọi tờ khai trong phiên làm việc">dùng chung</span>' : '';
        return '<div class="field' + wideClass + '"><label for="' + id + '">' + esc(f.label) + noteHtml + stdMark + '</label>' + inner + hintHtml + '</div>';
      }

      function renderFormScreen() {
        var form = getForm(state.formId);
        document.getElementById('formTitle').textContent = form.title;
        var dmn = DOMAIN_BY_ID[domainOf(form)];
        document.getElementById('formMeta').textContent = form.fullDoc
          ? ((dmn ? dmn.full + ' — ' : '') + 'mẫu ' + form.num + ', giữ nguyên bố cục bản gốc')
          : 'Mẫu ' + form.num + ' — Thông tư số 04/2020/TT-BTP';
        var host = document.getElementById('dataForm');
        var html = '';
        var currentSectionFields = [];
        var sectionTitle = null, sectionNote = null, sectionOptional = false, secIdx = 0;
        function flush() {
          if (sectionTitle === null && currentSectionFields.length === 0) return;
          secIdx++;
          // mọi mục đều mở sẵn để người dân không khai sót; mục tùy chọn có nút thu lại cho đỡ dài
          var cls = sectionOptional ? ' class="fs-opt"' : '';
          var toggle = sectionOptional ? '<span class="fs-toggle">Thu lại</span>' : '';
          var note = sectionNote ? '<div class="fs-note">' + esc(sectionNote) + '</div>' : '';
          html += '<fieldset' + cls + ' data-sec="' + secIdx + '"><div class="fs-legend">' + esc(sectionTitle || 'Thông tin') + toggle + '</div>' +
            '<div class="fs-inner">' + note + '<div class="field-grid">' + currentSectionFields.join('') + '</div></div></fieldset>';
          currentSectionFields = [];
          sectionNote = null; sectionOptional = false;
        }
        if (!form.fullDoc) {
          currentSectionFields.push(fieldHtml({ key: 'coQuan', label: 'Kính gửi (cơ quan tiếp nhận)', type: 'text', wide: true, placeholder: 'VD: Ủy ban nhân dân phường Đông Hưng Thuận' }));
          sectionTitle = 'Cơ quan tiếp nhận';
          flush();
          sectionTitle = null;
        }
        form.fields.forEach(function (f) {
          if (f.section) {
            flush();
            sectionTitle = f.section;
            sectionNote = f.secNote || null;
            sectionOptional = !!f.secOptional;
            return;
          }
          currentSectionFields.push(fieldHtml(f));
        });
        flush();
        host.innerHTML = html + Object.keys(SUGGEST).map(datalistHtml).join('');
        // nút chép thông tin từ mục khác
        host.querySelectorAll('.copybtn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var map = JSON.parse(btn.getAttribute('data-copy')), n = 0;
            Object.keys(map).forEach(function (dich) {
              var v = state.values[map[dich]];
              if (v !== undefined && String(v).trim() !== '') { state.values[dich] = v; n++; }
            });
            renderFormScreen();
            showToast(n ? 'Đã chép ' + n + ' thông tin sang mục này.' : 'Mục nguồn chưa có thông tin nào để chép.');
          });
        });

        // ô tra ngành, nghề kinh doanh
        host.querySelectorAll('[data-nganh]').forEach(function (inp) {
          var box = inp.closest('.nganhbox'), list = box.querySelector('.nganhlist');
          var maKey = inp.getAttribute('data-nganh');
          function ve() {
            var ds = timNganh(inp.value);
            if (!ds.length) {
              list.innerHTML = '<div class="nganh-none">Không tìm thấy ngành nào. Thử từ khác ngắn hơn — ví dụ <b>cho thuê</b>, <b>bán lẻ</b>, <b>sửa chữa</b>, <b>dịch vụ</b> — hoặc tự gõ thẳng tên ngành vào ô trên.</div>';
              list.hidden = false; return;
            }
            list.innerHTML = (ds.ganDung ? '<div class="nganh-near">Không có ngành trùng hẳn. Đây là những ngành gần nhất:</div>' : '') +
              ds.map(function (n) {
                return '<button type="button" class="nganh-item" data-ma="' + esc(n[0]) + '" data-ten="' + esc(n[1]) + '">' +
                  '<span class="nganh-ma">' + esc(n[0]) + '</span><span class="nganh-ten">' + esc(n[1]) + '</span></button>';
              }).join('');
            list.hidden = false;
            list.querySelectorAll('.nganh-item').forEach(function (it) {
              it.addEventListener('mousedown', function (e) {
                e.preventDefault();
                state.values[inp.getAttribute('data-key')] = it.getAttribute('data-ten');
                if (maKey) state.values[maKey] = it.getAttribute('data-ma');
                renderFormScreen();
              });
            });
          }
          inp.addEventListener('focus', ve);
          inp.addEventListener('input', ve);
          inp.addEventListener('blur', function () { setTimeout(function () { list.hidden = true; }, 120); });
        });

        host.querySelectorAll('fieldset.fs-opt .fs-legend').forEach(function (lg) {
          lg.addEventListener('click', function () {
            var fs = lg.parentNode;
            fs.classList.toggle('collapsed');
            lg.querySelector('.fs-toggle').textContent = fs.classList.contains('collapsed') ? 'Mở ra' : 'Thu lại';
          });
        });
        refreshProfileBar();

        // bind events
        host.querySelectorAll('[data-key]').forEach(function (el) {
          var evt = (el.type === 'radio' || el.type === 'checkbox') ? 'change' : 'input';
          el.addEventListener(evt, function () {
            var k = el.getAttribute('data-key');
            if (el.type === 'radio') {
              if (!el.checked) return;
              state.values[k] = el.value;
            } else if (el.type === 'checkbox') {
              state.values[k] = el.checked ? 'X' : '';
            } else {
              state.values[k] = el.value;
            }
            // ghi lại thông tin người khai & gợi ý địa chỉ cho những tờ khai sau
            var fd = fieldByKey(k);
            if (fd && fd.std && PROFILE_LABEL[fd.std]) { profile[fd.std] = state.values[k]; saveProfile(); refreshProfileBar(); }
            if (fd && fd.suggest) rememberSuggest(fd.suggest, state.values[k]);
            updateCounter();
          });
        });
        updateCounter();
        setupVoiceInputs(host);
      }

      function fieldByKey(k) {
        var form = getForm(state.formId); if (!form) return null;
        for (var i = 0; i < form.fields.length; i++) { if (form.fields[i].key === k) return form.fields[i]; }
        return null;
      }
      function refreshProfileBar() {
        var bar = document.getElementById('profileBar'); if (!bar) return;
        var n = profileCount();
        if (!n) { bar.hidden = true; bar.innerHTML = ''; return; }
        var who = [];
        if (profile.hoTen) who.push(profile.hoTen);
        if (profile.cccd) who.push('CCCD ' + profile.cccd);
        bar.hidden = false;
        bar.innerHTML = '<span class="pb-ic">✓</span>' +
          '<span class="pb-tx">Đang dùng thông tin người khai' +
          (who.length ? ': <b>' + esc(who.join(' — ')) + '</b>' : ' (đã lưu ' + n + ' mục)') +
          '. Các tờ khai sau tự điền sẵn; đóng trình duyệt là xoá hết.</span>' +
          '<button type="button" class="pb-clear" id="pbClear">Xoá, khai người mới</button>';
        document.getElementById('pbClear').addEventListener('click', function () {
          clearProfile();
          selectForm(state.formId);
        });
      }

      function updateCounter() {
        var form = getForm(state.formId);
        var total = form.fields.filter(function (f) { return !f.section; }).length;
        var filled = 0;
        form.fields.forEach(function (f) {
          if (f.section) return;
          var v = state.values[f.key];
          if (v && String(v).trim()) filled++;
        });
        document.getElementById('fieldCounter').textContent = filled + ' / ' + total + ' trường đã nhập';
      }


      /* ================= render: preview / document ================= */
      function renderPreview() {
        var form = getForm(state.formId);
        var v = Object.assign({}, state.values);
        // ghép "Giấy tờ tùy thân" từ 2 ô: số + ngày cấp
        form.fields.forEach(function (f) {
          if (f.type !== 'text' || !/^Giấy tờ tùy thân$/i.test(f.label)) return;
          var so = String(v[f.key] || '').trim(), ngay = v[f.key + '_ngayCap'];
          if (!so && !ngay) return;
          var txt = so ? (/^\d[\d\s]*$/.test(so) ? 'CCCD số ' + so.replace(/\s+/g, '') : so) : 'CCCD số …';
          if (ngay) txt += ', cấp ngày ' + fmtDateSlash(ngay);
          v[f.key] = txt;
        });
        document.getElementById('previewTitle').textContent = form.title;
        if (form.fullDoc) { document.getElementById('docOutput').innerHTML = '<div class="wdoc">' + form.body(v) + '</div>'; return; }

        var html = '';
        html += '<div class="doc-head"><div class="quochieu">Cộng hòa xã hội chủ nghĩa Việt Nam</div>' +
          '<div class="tieungu">Độc lập – Tự do – Hạnh phúc</div></div>';
        html += '<div class="doc-title">' + esc(form.docTitle) + '</div>';
        html += '<div class="doc-sub">' + (form.subTitle ? esc(form.subTitle) : '(Theo Thông tư số 04/2020/TT-BTP ngày 28/5/2020 của Bộ Tư pháp)') + '</div>';

        var office = v.coQuan || settings.office || '';
        html += '<div class="kinhgui">Kính gửi: ' + bl(office, 220) + '</div>';

        html += '<div class="doc-body">' + form.body(v) + '</div>';

        html += '<div class="camdoan">' + (form.camDoanText || 'Tôi cam đoan những nội dung khai trên đây là đúng sự thật và chịu trách nhiệm trước pháp luật về cam đoan của mình.') + '</div>';
        if (form.afterCamDoan) html += form.afterCamDoan(v);
        html += madeAtLine(v);

        // signature block(s) — printed blank, signed by hand on paper after printing
        if (form.signerMode === 'double') {
          var names = form.signerNames(v);
          var labels = form.signerLabels || ['Bên A', 'Bên B'];
          html += '<div class="siggrid">' +
            sigBoxHtml(labels[0], names[0]) +
            sigBoxHtml(labels[1], names[1]) +
            '</div>';
        } else {
          var name = form.signerName ? form.signerName(v) : '';
          var label = form.signerLabelOverride || 'Người yêu cầu';
          html += '<div class="siggrid single">' + sigBoxHtml(label, name) + '</div>';
        }

        html += '<div class="footnote">Tờ khai được lập điện tử dựa trên mẫu tại Phụ lục 5 kèm theo Thông tư số 04/2020/TT-BTP ngày 28/5/2020 của Bộ Tư pháp. Vui lòng kiểm tra kỹ thông tin trước khi in.</div>';

        document.getElementById('docOutput').innerHTML = html;
      }

      function sigBoxHtml(who, typedName) {
        return '<div class="sigbox">' +
          '<div class="who">' + esc(who) + '</div>' +
          '<div class="instr">(Ký, ghi rõ họ, chữ đệm, tên)</div>' +
          '<div class="sigline"></div>' +
          '<div class="signame">' + esc(typedName || '') + '</div>' +
          '</div>';
      }


      /* ================= events ================= */
      document.getElementById('toPreviewBtn').addEventListener('click', function () {
        renderPreview();
        showScreen('preview');
      });
      document.querySelectorAll('[data-back-to]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var to = btn.getAttribute('data-back-to');
          showScreen(to);
        });
      });
      document.getElementById('printBtn').addEventListener('click', function () {
        var btn = this;
        btn.disabled = true;
        var orig = btn.innerHTML;
        btn.innerHTML = 'Đang mở hộp thoại in…';
        setTimeout(function () {
          window.print();
          setTimeout(function () {
            btn.disabled = false;
            btn.innerHTML = orig;
          }, 400);
        }, 40);
      });
      document.getElementById('newFormBtn').addEventListener('click', function () {
        state.formId = null; state.values = {};
        document.getElementById('searchInput').value = '';
        applySearch();
        setOpenGroup(-1);
        showScreen('select');
      });

      /* search on the select screen */
      document.getElementById('searchInput').addEventListener('input', applySearch);
      document.getElementById('searchGoBtn').addEventListener('click', function (e) {
        e.preventDefault();
        applySearch();
        document.getElementById('searchInput').focus();
      });

      /* settings modal */
      document.getElementById('settingsBtn2').addEventListener('click', function () { document.getElementById('settingsBtn').click(); });
      document.getElementById('settingsBtn').addEventListener('click', function () {
        document.getElementById('setOffice').value = settings.office || '';
        document.getElementById('setPlace').value = settings.place || '';
        document.getElementById('settingsModal').classList.add('show');
      });
      document.getElementById('settingsCancel').addEventListener('click', function () {
        document.getElementById('settingsModal').classList.remove('show');
      });
      document.getElementById('settingsModal').addEventListener('click', function (e) {
        if (e.target === this) this.classList.remove('show');
      });
      document.getElementById('settingsSave').addEventListener('click', function () {
        settings.office = document.getElementById('setOffice').value.trim();
        settings.place = document.getElementById('setPlace').value.trim();
        saveSettings();
        refreshOfficeLabel();
        document.getElementById('settingsModal').classList.remove('show');
      });


      var CFG = { builtin: {}, custom: [] };
      var API_URL = 'api.php';
      var HAS_API = /^https?:$/.test(location.protocol);
      var STD_KEYS = { coQuan: 1, noiLap: 1, ngayLap: 1, capBanSao: 1, soLuongBanSao: 1 };
      var FIELD_TYPES = [['text', 'Chữ (1 dòng)'], ['textarea', 'Đoạn dài'], ['date', 'Ngày tháng'], ['radio', 'Chọn 1 (nút tròn)'], ['select', 'Danh sách chọn'], ['number', 'Số']];

      function fieldToSpec(f) {
        if (f.section) return { kind: 'section', title: f.section };
        var o = { key: f.key, label: f.label, type: f.type || 'text' };
        if (f.options) o.options = f.options.slice();
        if (f.note) o.note = f.note;
        if (f.default && f.default !== 'today') o.default = f.default;
        if (f.wide) o.wide = true;
        return o;
      }
      function specToForm(c, num) {
        var fields = [];
        (c.fields || []).forEach(function (s) {
          if (s.kind === 'section') fields.push(SEC(s.title || ''));
          else if (s.key && s.label) fields.push(Object.assign({ key: s.key, label: s.label, type: s.type || 'text' }, s.options ? { options: s.options } : {}, s.note ? { note: s.note } : {}, s.default ? { default: s.default } : {}, s.wide ? { wide: true } : {}));
        });
        fields.push(SEC('Nơi lập tờ khai'));
        fields.push(T('noiLap', 'Làm tại (địa danh)'));
        fields.push(D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }));
        if (c.hasCopy) { fields.push(R('capBanSao', 'Đề nghị cấp bản sao', YN)); fields.push(N('soLuongBanSao', 'Số lượng bản sao')); }
        var signerKey = c.signerKey || ((c.fields || []).filter(function (s) { return s.key && /họ.*tên/i.test(s.label); })[0] || {}).key;
        return {
          id: c.id, num: num, group: c.group, title: c.title, custom: true,
          docTitle: (c.docTitle || c.title || '').toUpperCase(),
          subTitle: c.subTitle, camDoanText: c.camDoan ? esc(c.camDoan) : undefined,
          fields: fields, signerMode: 'single', signerLabelOverride: c.signerLabel || 'Người yêu cầu',
          signerName: function (v) { return signerKey ? v[signerKey] : ''; },
          body: function (v) {
            var out = '';
            (c.fields || []).forEach(function (s) {
              if (s.kind === 'section') { if (s.title && s.showInPrint !== false) out += sectionHd(s.title); return; }
              if (!s.key || STD_KEYS[s.key]) return;
              var val = v[s.key];
              if (s.type === 'date') val = val ? fmtDateSlash(val) : '';
              out += ln(esc(s.label), val, s.note, s.type === 'date' ? 110 : 160);
            });
            return out;
          },
          afterCamDoan: c.hasCopy ? function (v) { return copyRequestLine(v); } : null
        };
      }
      function applyConfig(cfg) {
        CFG = { builtin: (cfg && cfg.builtin && typeof cfg.builtin === 'object') ? cfg.builtin : {}, custom: (cfg && Array.isArray(cfg.custom)) ? cfg.custom : [] };
        var list = [];
        BUILTIN_FORMS.forEach(function (f) {
          var o = CFG.builtin[f.id] || {};
          if (o.hidden) return;
          var g = Object.assign(Object.create(Object.getPrototypeOf(f)), f);
          if (o.title) g.title = o.title;
          if (o.group && GROUP_ORDER.indexOf(o.group) !== -1) g.group = o.group;
          list.push(g);
        });
        var maxNum = 20;
        CFG.custom.forEach(function (c) {
          if (!c.num) { c.num = 0; }
        });
        CFG.custom.forEach(function (c, i) {
          if (c.hidden || !c.id || !c.title) return;
          if (GROUP_ORDER.indexOf(c.group) === -1) c.group = GROUP_ORDER[GROUP_ORDER.length - 1];
          list.push(c.kind === 'docx' ? docxSpecToForm(c, 21 + i) : specToForm(c, 21 + i));
        });
        FORMS = list;
      }
      function refreshSelect() {
        var keep = openGroup;
        renderCards();
        setOpenGroup(keep);
        applySearch();
      }
      function loadRemoteConfig() {
        try { var cached = localStorage.getItem('tk_formcfg'); if (cached) { applyConfig(JSON.parse(cached)); } } catch (e) { }
        if (!HAS_API) return Promise.resolve();
        return fetch(API_URL + '?a=config', { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
          if (!j || !j.ok) return;
          applyConfig(j.config || {});
          try { localStorage.setItem('tk_formcfg', JSON.stringify(CFG)); } catch (e) { }
          if (state.screen === 'select') refreshSelect();
        }).catch(function () { });
      }

      /* ---------- màn hình quản trị ---------- */
      var ADM = { csrf: '', logged: false, setup: false, editing: null };
      function api(body) {
        body.csrf = ADM.csrf;
        return fetch(API_URL, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
          .then(function (r) { return r.json().catch(function () { return { ok: false, error: 'Máy chủ trả lời không hợp lệ (HTTP ' + r.status + ').' }; }); })
          .catch(function () { return { ok: false, error: 'Không kết nối được máy chủ.' }; });
      }
      function admHost() { return document.getElementById('adminBody'); }
      function openAdmin() {
        showScreen('admin');
        if (!HAS_API) {
          admHost().innerHTML = '<div class="adm-card"><h3>Chưa dùng được quản trị</h3><p>Anh/chị đang mở file trực tiếp trên máy. Phần quản trị mẫu chỉ chạy khi mở qua trang web trên host (có file <b>api.php</b>), ví dụ <b>https://…/tokhai/#quan-tri</b>.</p></div>';
          return;
        }
        admHost().innerHTML = '<div class="adm-card"><p>Đang kiểm tra…</p></div>';
        fetch(API_URL + '?a=status', { cache: 'no-store', credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
          ADM.csrf = j.csrf; ADM.setup = j.setup; ADM.logged = j.loggedIn;
          if (ADM.logged) return fetch(API_URL + '?a=config', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (c) { applyConfig(c.config || {}); renderAdminList(); });
          renderLogin();
        }).catch(function () { admHost().innerHTML = '<div class="adm-card"><h3>Không kết nối được máy chủ</h3><p>Kiểm tra file <b>api.php</b> đã được tải lên cùng thư mục với trang tờ khai chưa.</p></div>'; });
      }
      function renderLogin() {
        var first = !ADM.setup;
        admHost().innerHTML = '<div class="adm-card adm-login">' +
          '<h3>' + (first ? 'Tạo mật khẩu quản trị' : 'Đăng nhập quản trị') + '</h3>' +
          '<p class="hint">' + (first ? 'Lần đầu sử dụng: đặt mật khẩu cho người quản trị (ít nhất 8 ký tự). Hãy ghi nhớ mật khẩu này.' : 'Nhập mật khẩu để thêm, sửa, ẩn các mẫu tờ khai.') + '</p>' +
          '<div class="field"><label for="admPw">Mật khẩu</label><input type="password" id="admPw" autocomplete="' + (first ? 'new-password' : 'current-password') + '"></div>' +
          (first ? '<div class="field"><label for="admPw2">Nhập lại mật khẩu</label><input type="password" id="admPw2" autocomplete="new-password"></div>' : '') +
          '<div class="adm-err" id="admErr"></div>' +
          '<button class="btn primary" id="admLoginBtn" type="button">' + (first ? 'Tạo mật khẩu & vào quản trị' : 'Đăng nhập') + '</button></div>';
        var go = function () {
          var pw = document.getElementById('admPw').value, err = document.getElementById('admErr');
          if (first && pw !== document.getElementById('admPw2').value) { err.textContent = 'Hai mật khẩu không khớp.'; return; }
          api({ a: first ? 'setup' : 'login', password: pw }).then(function (j) {
            if (!j.ok) { err.textContent = j.error || 'Không đăng nhập được.'; return; }
            ADM.csrf = j.csrf || ADM.csrf; ADM.logged = true; openAdmin();
          });
        };
        document.getElementById('admLoginBtn').addEventListener('click', go);
        admHost().querySelectorAll('input').forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); }); });
        setTimeout(function () { var i = document.getElementById('admPw'); if (i) i.focus(); }, 50);
      }
      function saveCfg(msg) {
        return api({ a: 'save', config: CFG }).then(function (j) {
          if (!j.ok) { showToast('Chưa lưu được: ' + (j.error || 'lỗi')); if (j.error && /đăng nhập/.test(j.error)) { ADM.logged = false; renderLogin(); } return false; }
          applyConfig(CFG);
          try { localStorage.setItem('tk_formcfg', JSON.stringify(CFG)); } catch (e) { }
          renderCards();
          showToast(msg || 'Đã lưu. Mọi máy mở trang sẽ thấy thay đổi.');
          return true;
        });
      }
      function allAdminRows() {
        var rows = [];
        BUILTIN_FORMS.forEach(function (f) { var o = CFG.builtin[f.id] || {}; rows.push({ kind: 'builtin', id: f.id, num: f.num, title: o.title || f.title, group: (o.group && GROUP_ORDER.indexOf(o.group) !== -1) ? o.group : f.group, hidden: !!o.hidden, orig: f }); });
        CFG.custom.forEach(function (c, i) { rows.push({ kind: 'custom', id: c.id, num: 21 + i, title: c.title, group: c.group, hidden: !!c.hidden, spec: c }); });
        return rows;
      }
      function renderAdminList() {
        var rows = allAdminRows();
        var h = '<div class="adm-top"><div><h2>Quản trị mẫu tờ khai</h2><p class="hint">Ẩn/hiện, đổi tên, chuyển nhóm, thêm hoặc thay mẫu bằng file Word (.docx). Mỗi thay đổi được lưu ngay lên host.</p></div>' +
          '<div class="adm-actions"><label class="btn primary adm-upload">+ Thêm mẫu từ file Word<input type="file" id="admAddDocx" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label><button class="btn" id="admPass" type="button">Đổi mật khẩu</button><button class="btn" id="admOut" type="button">Đăng xuất</button></div></div>';
        GROUP_ORDER.forEach(function (g) {
          var list = rows.filter(function (r) { return r.group === g; });
          h += '<div class="adm-card"><h3>' + esc(g) + ' <span class="cnt">' + list.filter(function (r) { return !r.hidden; }).length + ' đang hiện</span></h3>';
          if (!list.length) h += '<p class="hint">Chưa có mẫu nào.</p>';
          list.forEach(function (r) {
            h += '<div class="adm-row' + (r.hidden ? ' is-hidden' : '') + '" data-id="' + esc(r.id) + '" data-kind="' + r.kind + '">' +
              '<span class="num">' + r.num + '</span><span class="t">' + esc(r.title) + (r.kind === 'custom' ? ' <em class="tag">Tự tạo</em>' : '') + (r.hidden ? ' <em class="tag off">Đang ẩn</em>' : '') + '</span>' +
              '<label class="sw" title="Hiện trên trang"><input type="checkbox" data-act="toggle"' + (r.hidden ? '' : ' checked') + '><span></span></label>' +
              '<button class="btn sm" data-act="edit" type="button">Sửa</button>' +
              (r.kind === 'builtin' ? '<label class="btn sm adm-upload" title="Tải file Word mẫu mới để thay mẫu này (mẫu gốc sẽ tự ẩn)">Thay bằng file Word<input type="file" data-act="replace" accept=".docx"></label>' : '<label class="btn sm adm-upload" title="Tải file Word mới để cập nhật mẫu này">Thay file Word<input type="file" data-act="replace" accept=".docx"></label><button class="btn sm danger" data-act="del" type="button">Xóa</button>') +
              '</div>';
          });
          h += '</div>';
        });
        admHost().innerHTML = h;
        document.getElementById('admAddDocx').onchange = function () { if (this.files[0]) importDocx(this.files[0], null); this.value = ''; };
        document.getElementById('admOut').onclick = function () { api({ a: 'logout' }).then(function () { ADM.logged = false; fetch(API_URL + '?a=status', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) { ADM.csrf = j.csrf; ADM.setup = j.setup; renderLogin(); }); }); };
        document.getElementById('admPass').onclick = changePassword;
        admHost().querySelectorAll('.adm-row').forEach(function (row) {
          var id = row.getAttribute('data-id'), kind = row.getAttribute('data-kind');
          row.querySelectorAll('[data-act]').forEach(function (el) {
            var act = el.getAttribute('data-act');
            el.addEventListener(act === 'toggle' || act === 'replace' ? 'change' : 'click', function () {
              if (act === 'replace') { var fl = el.files[0]; el.value = ''; if (fl) importDocx(fl, { kind: kind, id: id }); return; }
              if (act === 'toggle') {
                if (kind === 'builtin') { CFG.builtin[id] = Object.assign({}, CFG.builtin[id], { hidden: !el.checked }); }
                else { customById(id).hidden = !el.checked; }
                saveCfg(el.checked ? 'Đã hiện mẫu.' : 'Đã ẩn mẫu.').then(renderAdminList);
              } else if (act === 'edit') {
                if (kind === 'builtin') openBuiltinEditor(id); else { var cs = customById(id); cs.kind === 'docx' ? openDocxReview(cs, null) : openEditor(cs); }
              } else if (act === 'copy') {
                var f = BUILTIN_FORMS.filter(function (x) { return x.id === id; })[0];
                var o = CFG.builtin[id] || {};
                var spec = { id: 'm' + Date.now().toString(36), title: (o.title || f.title), group: (o.group || f.group), docTitle: f.docTitle, signerLabel: f.signerLabelOverride || (f.signerLabels ? f.signerLabels[0] : 'Người yêu cầu'), fields: [], hasCopy: false, basedOn: id, hidden: true };
                f.fields.forEach(function (x) { if (x.key && STD_KEYS[x.key]) { if (x.key === 'capBanSao') spec.hasCopy = true; return; } if (x.section && /^Nơi lập/.test(x.section)) return; spec.fields.push(fieldToSpec(x)); });
                openEditor(spec, true);
              } else if (act === 'del') {
                if (!confirm('Xóa hẳn mẫu "' + customById(id).title + '"? (Có thể khôi phục từ bản sao lưu trên host.)')) return;
                CFG.custom = CFG.custom.filter(function (c) { return c.id !== id; });
                saveCfg('Đã xóa mẫu.').then(renderAdminList);
              }
            });
          });
        });
      }
      function customById(id) { return CFG.custom.filter(function (c) { return c.id === id; })[0]; }
      function groupSelect(id, val) {
        return '<select id="' + id + '">' + GROUP_ORDER.map(function (g) { return '<option' + (g === val ? ' selected' : '') + '>' + esc(g) + '</option>'; }).join('') + '</select>';
      }
      function openBuiltinEditor(id) {
        var f = BUILTIN_FORMS.filter(function (x) { return x.id === id; })[0], o = CFG.builtin[id] || {};
        admHost().innerHTML = '<div class="adm-card"><h3>Sửa mẫu có sẵn: ' + esc(f.title) + '</h3>' +
          '<p class="hint">Mẫu có sẵn chỉ đổi được tên hiển thị và nhóm. Khi có mẫu mới theo quy định, bấm <b>Thay bằng file Word</b> ở danh sách để tải file mẫu mới lên.</p>' +
          '<div class="field"><label for="beTitle">Tên hiển thị</label><input type="text" id="beTitle" value="' + esc(o.title || f.title) + '"></div>' +
          '<div class="field"><label for="beGroup">Nhóm</label>' + groupSelect('beGroup', o.group || f.group) + '</div>' +
          '<div class="adm-actions"><button class="btn" id="beBack" type="button">← Quay lại</button><button class="btn" id="beReset" type="button">Khôi phục như cũ</button><button class="btn primary" id="beSave" type="button">Lưu</button></div></div>';
        document.getElementById('beBack').onclick = renderAdminList;
        document.getElementById('beReset').onclick = function () { delete CFG.builtin[id]; saveCfg('Đã khôi phục mẫu gốc.').then(renderAdminList); };
        document.getElementById('beSave').onclick = function () {
          var t = document.getElementById('beTitle').value.trim(), g = document.getElementById('beGroup').value;
          CFG.builtin[id] = Object.assign({}, o, { title: t && t !== f.title ? t : undefined, group: g !== f.group ? g : undefined });
          saveCfg().then(renderAdminList);
        };
      }
      function fieldRowHtml(s, i) {
        if (s.kind === 'section') {
          return '<div class="fe-row sec" data-i="' + i + '"><span class="fe-badge">Tiêu đề phần</span><input type="text" data-k="title" value="' + esc(s.title || '') + '" placeholder="VD: Thông tin người yêu cầu">' +
            '<span class="fe-btns"><button type="button" data-mv="-1" title="Lên">↑</button><button type="button" data-mv="1" title="Xuống">↓</button><button type="button" data-rm title="Xóa">✕</button></span></div>';
        }
        var choice = s.type === 'radio' || s.type === 'select';
        return '<div class="fe-row" data-i="' + i + '">' +
          '<select data-k="type">' + FIELD_TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (t[0] === (s.type || 'text') ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select>' +
          '<input type="text" data-k="label" value="' + esc(s.label || '') + '" placeholder="Tên ô (VD: Họ, chữ đệm, tên)">' +
          '<input type="text" data-k="options" value="' + esc((s.options || []).join(', ')) + '" placeholder="Các lựa chọn, cách nhau dấu phẩy"' + (choice ? '' : ' hidden') + '>' +
          '<input type="text" data-k="default" value="' + esc(s.default || '') + '" placeholder="Điền sẵn (nếu có)"' + (s.type === 'date' ? ' hidden' : '') + '>' +
          '<span class="fe-btns"><button type="button" data-mv="-1" title="Lên">↑</button><button type="button" data-mv="1" title="Xuống">↓</button><button type="button" data-rm title="Xóa">✕</button></span></div>';
      }
      function openEditor(spec, isCopy) {
        var isNew = !spec || isCopy;
        var s = JSON.parse(JSON.stringify(spec || { id: 'm' + Date.now().toString(36), title: '', group: GROUP_ORDER[0], docTitle: '', signerLabel: 'Người yêu cầu', hasCopy: false, fields: [{ kind: 'section', title: 'Người yêu cầu' }, { key: 'f1', label: 'Họ, chữ đệm, tên người yêu cầu', type: 'text' }, { key: 'f2', label: 'Nơi cư trú', type: 'text' }, { key: 'f3', label: 'Giấy tờ tùy thân', type: 'text' }] }));
        ADM.editing = s;
        function draw() {
          admHost().innerHTML = '<div class="adm-card"><h3>' + (isCopy ? 'Tạo bản sửa từ mẫu có sẵn' : (spec ? 'Sửa mẫu' : 'Thêm mẫu mới')) + '</h3>' +
            (isCopy ? '<p class="hint">Bản sửa sẽ thay thế mẫu gốc: khi lưu, mẫu gốc tự ẩn và bản sửa được hiện. Bản in dùng bố cục chung (mỗi ô một dòng).</p>' : '') +
            '<div class="fe-grid">' +
            '<div class="field"><label for="feTitle">Tên hiển thị trên trang</label><input type="text" id="feTitle" value="' + esc(s.title) + '" placeholder="VD: Tờ khai đăng ký khai sinh"></div>' +
            '<div class="field"><label for="feGroup">Nhóm</label>' + groupSelect('feGroup', s.group) + '</div>' +
            '<div class="field"><label for="feDoc">Tiêu đề in trên tờ khai</label><input type="text" id="feDoc" value="' + esc(s.docTitle || '') + '" placeholder="Để trống = giống tên hiển thị (tự viết hoa)"></div>' +
            '<div class="field"><label for="feSigner">Người ký (dưới chữ ký)</label><input type="text" id="feSigner" value="' + esc(s.signerLabel || 'Người yêu cầu') + '"></div>' +
            '<div class="field wide"><label for="feSub">Dòng căn cứ dưới tiêu đề</label><input type="text" id="feSub" value="' + esc(s.subTitle || '') + '" placeholder="Để trống = (Theo Thông tư số 04/2020/TT-BTP ngày 28/5/2020 của Bộ Tư pháp)"></div>' +
            '<div class="field wide"><label for="feCam">Lời cam đoan</label><textarea id="feCam" placeholder="Để trống = lời cam đoan chuẩn">' + esc(s.camDoan || '') + '</textarea></div>' +
            '<label class="chk wide"><input type="checkbox" id="feCopy"' + (s.hasCopy ? ' checked' : '') + '> Có mục "Đề nghị cấp bản sao" và số lượng</label>' +
            '</div>' +
            '<h4>Các ô cần nhập <span class="hint">(Kính gửi, Làm tại, ngày lập tờ khai được tự thêm)</span></h4>' +
            '<div id="feRows">' + s.fields.map(fieldRowHtml).join('') + '</div>' +
            '<div class="adm-actions left"><button class="btn" id="feAddF" type="button">+ Thêm ô nhập</button><button class="btn" id="feAddS" type="button">+ Thêm tiêu đề phần</button></div>' +
            '<div class="adm-err" id="feErr"></div>' +
            '<div class="adm-actions"><button class="btn" id="feBack" type="button">← Hủy</button><button class="btn" id="fePrev" type="button">Xem thử</button><button class="btn primary" id="feSave" type="button">Lưu mẫu</button></div></div>';
          bind();
        }
        function collect() {
          s.title = document.getElementById('feTitle').value.trim();
          s.group = document.getElementById('feGroup').value;
          s.docTitle = document.getElementById('feDoc').value.trim();
          s.signerLabel = document.getElementById('feSigner').value.trim() || 'Người yêu cầu';
          s.subTitle = document.getElementById('feSub').value.trim() || undefined;
          s.camDoan = document.getElementById('feCam').value.trim() || undefined;
          s.hasCopy = document.getElementById('feCopy').checked;
          document.querySelectorAll('#feRows .fe-row').forEach(function (r) {
            var f = s.fields[+r.getAttribute('data-i')];
            r.querySelectorAll('[data-k]').forEach(function (el) {
              var k = el.getAttribute('data-k'), v = el.value.trim();
              if (k === 'options') f.options = v ? v.split(',').map(function (x) { return x.trim(); }).filter(Boolean) : undefined;
              else if (k === 'default') f.default = v || undefined;
              else f[k] = v;
            });
            if (f.kind !== 'section' && f.type !== 'radio' && f.type !== 'select') delete f.options;
          });
        }
        function nextKey() { var n = 1; var used = {}; s.fields.forEach(function (f) { if (f.key) used[f.key] = 1; }); while (used['f' + n]) n++; return 'f' + n; }
        function bind() {
          document.querySelectorAll('#feRows .fe-row').forEach(function (r) {
            var i = +r.getAttribute('data-i');
            r.querySelectorAll('[data-mv]').forEach(function (b) { b.onclick = function () { collect(); var j = i + (+b.getAttribute('data-mv')); if (j < 0 || j >= s.fields.length) return; var t = s.fields[i]; s.fields[i] = s.fields[j]; s.fields[j] = t; draw(); }; });
            var rm = r.querySelector('[data-rm]'); if (rm) rm.onclick = function () { collect(); s.fields.splice(i, 1); draw(); };
            var ty = r.querySelector('[data-k="type"]'); if (ty) ty.onchange = function () { collect(); draw(); };
          });
          document.getElementById('feAddF').onclick = function () { collect(); s.fields.push({ key: nextKey(), label: '', type: 'text' }); draw(); var ins = document.querySelectorAll('#feRows [data-k="label"]'); if (ins.length) ins[ins.length - 1].focus(); };
          document.getElementById('feAddS').onclick = function () { collect(); s.fields.push({ kind: 'section', title: '' }); draw(); };
          document.getElementById('feBack').onclick = renderAdminList;
          document.getElementById('fePrev').onclick = function () {
            collect();
            var f = specToForm(s, 0);
            var holdF = FORMS, holdS = state.formId, holdV = state.values;
            FORMS = [f]; state.formId = f.id; state.values = {};
            f.fields.forEach(function (x) { if (x.default === 'today') state.values[x.key] = todayIso(); else if (x.default) state.values[x.key] = x.default; });
            state.values.coQuan = settings.office; state.values.noiLap = settings.place;
            renderPreview();
            var w = window.open('', '_blank');
            if (w) { w.document.write('<meta charset="utf-8"><title>Xem thử</title><style>' + document.querySelector('style').textContent + '</style><div class="doc-shell" style="margin:20px auto">' + document.getElementById('docOutput').outerHTML + '</div>'); w.document.close(); }
            FORMS = holdF; state.formId = holdS; state.values = holdV;
          };
          document.getElementById('feSave').onclick = function () {
            collect();
            var err = document.getElementById('feErr');
            if (!s.title) { err.textContent = 'Chưa nhập tên mẫu.'; return; }
            var inputs = s.fields.filter(function (f) { return f.kind !== 'section'; });
            if (!inputs.length) { err.textContent = 'Mẫu cần ít nhất 1 ô nhập.'; return; }
            var bad = inputs.filter(function (f) { return !f.label; })[0];
            if (bad) { err.textContent = 'Còn ô nhập chưa có tên.'; return; }
            var badOpt = inputs.filter(function (f) { return (f.type === 'radio' || f.type === 'select') && !(f.options && f.options.length); })[0];
            if (badOpt) { err.textContent = 'Ô "' + badOpt.label + '" cần có các lựa chọn.'; return; }
            s.fields = s.fields.filter(function (f) { return f.kind !== 'section' || f.title; });
            if (isNew) {
              s.hidden = false;
              CFG.custom.push(s);
              if (isCopy && s.basedOn) CFG.builtin[s.basedOn] = Object.assign({}, CFG.builtin[s.basedOn], { hidden: true });
            } else {
              var idx = CFG.custom.findIndex(function (c) { return c.id === s.id; });
              CFG.custom[idx] = s;
            }
            saveCfg(isCopy ? 'Đã lưu bản sửa và ẩn mẫu gốc.' : 'Đã lưu mẫu.').then(function (ok) { if (ok) renderAdminList(); });
          };
        }
        draw();
      }
      function sentenceCase(t) { t = String(t || '').toLowerCase(); return t.charAt(0).toUpperCase() + t.slice(1); }
      function importDocx(file, target) {
        if (!/\.docx$/i.test(file.name)) { showToast('Cần file Word dạng .docx. File .doc cũ hãy mở bằng Word rồi Lưu thành (Save as) .docx.'); return; }
        if (file.size > 5 * 1024 * 1024) { showToast('File quá lớn (tối đa 5MB).'); return; }
        showToast('Đang đọc file Word…');
        file.arrayBuffer().then(function (buf) { return unzipEntry(buf, 'word/document.xml'); }).then(function (xml) {
          var parsed = docxToForm(docxParse(xml));
          if (!parsed.fields.length) { showToast('Không tìm thấy chỗ nào để điền (dấu chấm …… hoặc gạch ____) trong file.'); return; }
          var base;
          if (target && target.kind === 'custom') { base = customById(target.id); }
          else if (target && target.kind === 'builtin') { var bf = BUILTIN_FORMS.filter(function (x) { return x.id === target.id; })[0]; var bo = CFG.builtin[target.id] || {}; base = { title: bo.title || bf.title, group: bo.group || bf.group, basedOn: target.id }; }
          var spec = {
            id: (base && base.id) || ('w' + Date.now().toString(36)), kind: 'docx',
            title: (base && base.title) || (parsed.title ? sentenceCase(parsed.title) : file.name.replace(/\.docx$/i, '')),
            group: (base && base.group) || GROUP_ORDER[GROUP_ORDER.length - 1], basedOn: base && base.basedOn, hidden: false,
            fileName: file.name, blocks: parsed.blocks, fields: parsed.fields
          };
          // giữ lại tên ô đã sửa trước đó nếu cập nhật file mới
          if (base && base.fields) { spec.fields.forEach(function (f, i) { var old = base.fields[i]; if (old && old.origLabel === f.label && old.label !== old.origLabel) f.label = old.label; }); }
          spec.fields.forEach(function (f) { f.origLabel = f.label; });
          openDocxReview(spec, target || { kind: 'new' });
        }).catch(function (e) { showToast('Không đọc được file: ' + (e && e.message || e)); });
      }
      function openDocxReview(spec, target) {
        var s = JSON.parse(JSON.stringify(spec));
        var isNew = !!target;
        var rows = '', lastSec = null;
        s.fields.forEach(function (f, i) {
          if (f.section !== lastSec) { rows += '<tr class="sec"><td colspan="3">' + esc(f.section) + '</td></tr>'; lastSec = f.section; }
          rows += '<tr><td style="width:54%"><input type="text" data-i="' + i + '" value="' + esc(f.label) + '"></td><td>' + (f.type === 'radio' ? 'Chọn 1: ' + esc((f.options || []).join(' / ')) : f.std === 'office' ? 'Tự điền tên cơ quan' : f.std === 'place' ? 'Tự điền địa danh' : (f.std || '').indexOf('date-') === 0 ? 'Tự điền ngày hôm nay' : f.default ? 'Điền sẵn: ' + esc(f.default) : 'Chữ') + '</td></tr>';
        });
        admHost().innerHTML = '<div class="adm-card"><h3>' + (isNew ? (target.kind === 'builtin' ? 'Thay mẫu có sẵn bằng file Word' : target.kind === 'custom' ? 'Cập nhật mẫu từ file Word mới' : 'Thêm mẫu từ file Word') : 'Sửa mẫu') + (s.fileName ? ' <span class="cnt">' + esc(s.fileName) + '</span>' : '') + '</h3>' +
          '<p class="hint">Mỗi chỗ có dấu chấm (……) hoặc gạch (____) trong file Word thành một ô nhập; dấu ☐ thành ô chọn. Bản in giữ nguyên chữ và bố cục của file Word. ' + (target && target.kind === 'builtin' ? 'Khi lưu, mẫu gốc sẽ tự ẩn.' : '') + '</p>' +
          '<div class="fe-grid"><div class="field"><label for="dxTitle">Tên hiển thị trên trang</label><input type="text" id="dxTitle" value="' + esc(s.title) + '"></div>' +
          '<div class="field"><label for="dxGroup">Nhóm</label>' + groupSelect('dxGroup', s.group) + '</div></div>' +
          '<div class="adm-2col"><div><h4>Các ô nhập tìm được (' + s.fields.length + ') <span class="hint">— sửa lại tên ô cho dễ hiểu nếu cần</span></h4><table class="adm-fields"><thead><tr><th>Tên ô</th><th>Kiểu</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
          '<div><h4>Bản in (xem trước)</h4><div class="adm-docprev doc"><div class="wdoc">' + docxRender(s.blocks, {}) + '</div></div></div></div>' +
          '<div class="adm-err" id="dxErr"></div><div class="adm-actions"><button class="btn" id="dxBack" type="button">← Hủy</button><button class="btn primary" id="dxSave" type="button">Lưu mẫu</button></div></div>';
        document.getElementById('dxBack').onclick = renderAdminList;
        document.getElementById('dxSave').onclick = function () {
          s.title = document.getElementById('dxTitle').value.trim();
          s.group = document.getElementById('dxGroup').value;
          if (!s.title) { document.getElementById('dxErr').textContent = 'Chưa nhập tên mẫu.'; return; }
          admHost().querySelectorAll('.adm-fields input[data-i]').forEach(function (inp) { var f = s.fields[+inp.getAttribute('data-i')]; f.label = inp.value.trim() || f.origLabel || 'Nội dung'; });
          var idx = CFG.custom.findIndex(function (c) { return c.id === s.id; });
          if (idx >= 0) CFG.custom[idx] = s; else CFG.custom.push(s);
          if (s.basedOn) CFG.builtin[s.basedOn] = Object.assign({}, CFG.builtin[s.basedOn], { hidden: true });
          saveCfg(s.basedOn && idx < 0 ? 'Đã lưu mẫu mới và ẩn mẫu cũ.' : 'Đã lưu mẫu.').then(function (ok) { if (ok) renderAdminList(); });
        };
      }
      function changePassword() {
        admHost().innerHTML = '<div class="adm-card adm-login"><h3>Đổi mật khẩu</h3>' +
          '<div class="field"><label for="cpOld">Mật khẩu hiện tại</label><input type="password" id="cpOld" autocomplete="current-password"></div>' +
          '<div class="field"><label for="cpNew">Mật khẩu mới (ít nhất 8 ký tự)</label><input type="password" id="cpNew" autocomplete="new-password"></div>' +
          '<div class="field"><label for="cpNew2">Nhập lại mật khẩu mới</label><input type="password" id="cpNew2" autocomplete="new-password"></div>' +
          '<div class="adm-err" id="cpErr"></div><div class="adm-actions"><button class="btn" id="cpBack" type="button">← Quay lại</button><button class="btn primary" id="cpSave" type="button">Đổi mật khẩu</button></div></div>';
        document.getElementById('cpBack').onclick = renderAdminList;
        document.getElementById('cpSave').onclick = function () {
          var n = document.getElementById('cpNew').value;
          if (n !== document.getElementById('cpNew2').value) { document.getElementById('cpErr').textContent = 'Hai mật khẩu mới không khớp.'; return; }
          api({ a: 'password', old: document.getElementById('cpOld').value, new: n }).then(function (j) {
            if (!j.ok) { document.getElementById('cpErr').textContent = j.error; return; }
            showToast('Đã đổi mật khẩu.'); renderAdminList();
          });
        };
      }
      function routeHash() { if (/^#quan-?tri$/i.test(location.hash)) openAdmin(); }
      window.addEventListener('hashchange', function () { if (/^#quan-?tri$/i.test(location.hash)) openAdmin(); else if (state.screen === 'admin') { showScreen('select'); refreshSelect(); } });

      document.getElementById('openAdminBtn').addEventListener('click', function () { document.getElementById('settingsModal').classList.remove('show'); location.hash = 'quan-tri'; openAdmin(); });
      document.getElementById('admExit').addEventListener('click', function () { history.replaceState(null, '', location.pathname + location.search); showScreen('select'); refreshSelect(); });

      /* ================= init ================= */
      window.quickFilter = function (kw) {
        var inp = document.getElementById('searchInput');
        if (inp) {
          inp.value = kw;
          applySearch();
          inp.focus();
          try { inp.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) { }
        }
      };
      var BRAND_LOGO = './logo.png'; // logo đơn vị (data URI) — để trống thì dùng biểu tượng tờ khai
      if (BRAND_LOGO) {
        var bl_ = document.getElementById('brandLogo');
        bl_.classList.add('has-logo');
        bl_.innerHTML = '<img src="' + BRAND_LOGO + '" alt="Logo Trung tâm phục vụ hành chính công phường Đông Hưng Thuận">';
        var mk = document.querySelector('.brand .mark');
        if (mk) { mk.innerHTML = '<img src="' + BRAND_LOGO + '" alt="" style="width:100%;height:100%;object-fit:contain;border-radius:50%;background:#fff;">'; mk.style.background = '#fff'; mk.style.borderRadius = '50%'; mk.style.padding = '2px'; }
      }
      function fitSelect() {
        var sel = document.querySelector('.sel'); if (!sel) return;
        var w = document.querySelector('.wrap').clientWidth;
        var desktop = window.innerWidth >= 1300;
        var z = desktop ? Math.min(1, w / 1640) : 1;
        sel.style.zoom = z;
        var wrap = document.querySelector('.wrap'), cs = getComputedStyle(wrap);
        var avail = window.innerHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0) - 2;
        sel.style.minHeight = (state.screen === 'select' ? Math.max(0, avail / z) : 0) + 'px';
      }
      window.addEventListener('resize', fitSelect);
      window.addEventListener('load', fitSelect);
      try { document.fonts && document.fonts.ready.then(fitSelect); } catch (e) { }
      fitSelect();
      refreshOfficeLabel();
      loadRemoteConfig();
      renderCards();
      setOpenGroup(-1);
      showScreen('select');
      routeHash();
      setTimeout(function () { document.getElementById('quickGrid').classList.add('no-intro'); document.getElementById('cardGroups').classList.add('no-intro'); }, 1500);



        window.addEventListener('beforeprint', function () {
          if (window._stopHeroCanvas) window._stopHeroCanvas();
        });
        window.addEventListener('afterprint', function () {
          if (state.screen === 'select' && window._startHeroCanvas) window._startHeroCanvas();
        });

        if (state.screen === 'select') {
          window._startHeroCanvas();
        }

  // Export state & functions for debugging
  window.state = state;
  window.settings = settings;
  window.showScreen = showScreen;
  window.renderFormScreen = renderFormScreen;
  window.renderPreview = renderPreview;
  window.renderCards = renderCards;
})(window, document);
