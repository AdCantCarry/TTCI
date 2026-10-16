/**
 * Form Templates: Civil Status (20 Forms) & Field Helpers
 * Trung tam Cung ung Dich vu cong phuong Dong Hung Thuan
 */
(function (window) {
  'use strict';

      /* ================= Vietnamese number-to-words (for ngày sinh ghi bằng chữ) ================= */
      var DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
      function readSmall(n) {
        n = Math.max(0, Math.floor(n));
        if (n < 10) return DIGITS[n];
        if (n === 10) return 'mười';
        var t = Math.floor(n / 10), u = n % 10;
        var s = (t === 1) ? 'mười' : DIGITS[t] + ' mươi';
        if (u === 1 && t > 1) s += ' mốt';
        else if (u === 5) s += ' lăm';
        else if (u === 4 && t > 1) s += ' tư';
        else if (u > 0) s += ' ' + DIGITS[u];
        return s;
      }
      function readYear(n) {
        n = Math.floor(n);
        if (n < 100) return readSmall(n);
        var th = Math.floor(n / 1000), rem = n % 1000;
        var h = Math.floor(rem / 100), rem2 = rem % 100;
        var parts = [];
        if (th > 0) parts.push(DIGITS[th] + ' nghìn');
        if (h > 0) parts.push(DIGITS[h] + ' trăm');
        else if (th > 0 && rem2 > 0) parts.push('không trăm');
        if (rem2 > 0) {
          var t = Math.floor(rem2 / 10), u = rem2 % 10;
          if (t === 0) parts.push('lẻ ' + DIGITS[u]);
          else if (t === 1) { var s = 'mười'; if (u === 1) s += ' một'; else if (u === 5) s += ' lăm'; else if (u > 0) s += ' ' + DIGITS[u]; parts.push(s); }
          else { var s2 = DIGITS[t] + ' mươi'; if (u === 1) s2 += ' mốt'; else if (u === 5) s2 += ' lăm'; else if (u === 4) s2 += ' tư'; else if (u > 0) s2 += ' ' + DIGITS[u]; parts.push(s2); }
        }
        return parts.join(' ').trim();
      }
      function dateInWords(iso) {
        if (!iso) return '';
        var p = iso.split('-'); if (p.length !== 3) return '';
        var y = +p[0], m = +p[1], d = +p[2];
        return 'Ngày ' + readSmall(d) + ' tháng ' + readSmall(m) + ' năm ' + readYear(y);
      }
      function fmtDate(iso) {
        if (!iso) return { d: '', m: '', y: '' };
        var p = iso.split('-'); if (p.length !== 3) return { d: '', m: '', y: '' };
        return { d: String(+p[1 + 1]).padStart ? String(+p[2]) : p[2], m: String(+p[1]), y: p[0] };
      }
      function fmtDateSlash(iso) {
        if (!iso) return '';
        var p = iso.split('-'); if (p.length !== 3) return '';
        return p[2] + '/' + p[1] + '/' + p[0];
      }

      /* ================= field helpers ================= */
      function T(key, label, extra) { return Object.assign({ key: key, label: label, type: 'text' }, extra || {}); }
      function TA(key, label, extra) { return Object.assign({ key: key, label: label, type: 'textarea' }, extra || {}); }
      function D(key, label, extra) { return Object.assign({ key: key, label: label, type: 'date' }, extra || {}); }
      function R(key, label, options, extra) { return Object.assign({ key: key, label: label, type: 'radio', options: options }, extra || {}); }
      function SEL(key, label, options, extra) { return Object.assign({ key: key, label: label, type: 'select', options: options }, extra || {}); }
      function N(key, label, extra) { return Object.assign({ key: key, label: label, type: 'number' }, extra || {}); }
      function SEC(title) { return { section: title }; }

      function esc(s) {
        if (s === undefined || s === null) s = '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      function bl(v, w) {
        v = (v === undefined || v === null) ? '' : String(v).trim();
        if (!v) return '<span class="blank" style="min-width:' + (w || 90) + 'px"></span>';
        return '<span class="filled">' + esc(v) + '</span>';
      }
      function ln(label, v, note, w) {
        return '<div class="fline"><span class="flabel">' + label + (note ? ' <sup>(' + note + ')</sup>' : '') + ':</span> ' + bl(v, w) + '</div>';
      }
      function lnT(lineHtml, tail) { return lineHtml.replace(/<\/div>$/, tail + '</div>'); }
      function lnrow(items) {
        var out = items.map(function (it) { return '<span class="flabel">' + it[0] + ':</span> ' + bl(it[1], it[2] || 70); });
        return '<div class="fline">' + out.join('&nbsp;&nbsp;&nbsp;') + '</div>';
      }
      function para(text) { return '<div class="para">' + text + '</div>'; }
      function sectionHd(t) { return '<div class="section-hd">' + esc(t) + '</div>'; }

      function personLine(v, prefix, opts) {
        opts = opts || {};
        var out = '';
        out += ln('Họ, chữ đệm, tên', v[prefix + '_hoTen']);
        if (opts.dob !== false) {
          var noteKey = prefix + '_ngaySinh';
          if (opts.dobWords) {
            out += ln('Ngày, tháng, năm sinh', v[noteKey] ? fmtDateSlash(v[noteKey]) : '', null, 110);
            out += '<div class="fline" style="font-style:italic;color:var(--muted);">' + (v[noteKey] ? dateInWords(v[noteKey]) : '&nbsp;') + '</div>';
          } else if (opts.yearOnly) {
            out += ln('Năm sinh', v[prefix + '_namSinh'], null, 60);
          } else {
            out += ln('Ngày, tháng, năm sinh', v[noteKey] ? fmtDateSlash(v[noteKey]) : '', null, 110);
          }
        }
        var row = [];
        if (opts.gender !== false) row.push(['Giới tính', v[prefix + '_gioiTinh'], 60]);
        row.push(['Dân tộc', v[prefix + '_danToc'], 70]);
        row.push(['Quốc tịch', v[prefix + '_quocTich'], 90]);
        out += lnrow(row);
        if (opts.noiSinh) out += ln('Nơi sinh', v[prefix + '_noiSinh']);
        if (opts.queQuan) out += ln('Quê quán', v[prefix + '_queQuan']);
        if (opts.residence !== false) out += ln('Nơi cư trú', v[prefix + '_noiCuTru'], '2');
        if (opts.paper !== false) out += ln('Giấy tờ tùy thân', v[prefix + '_giayTo'], '3');
        return out;
      }

      function copyRequestLine(v, footnoteNum) {
        var co = v.capBanSao === 'Có' ? '<b>Có</b> ☑' : 'Có ☐';
        var kh = v.capBanSao === 'Không' ? '<b>Không</b> ☑' : 'Không ☐';
        return '<div class="fline">Đề nghị cấp bản sao' + (footnoteNum ? ' <sup>(' + footnoteNum + ')</sup>' : '') + ': ' + co + '&nbsp;&nbsp; ' + kh + '&nbsp;&nbsp; Số lượng: ' + bl(v.soLuongBanSao, 40) + ' bản</div>';
      }

      function madeAtLine(v) {
        var place = v.noiLap || settings.place || '';
        var day = fmtDate(v.ngayLap);
        return '<div class="madeAt">Làm tại: ' + bl(place, 140) + ', ngày ' + bl(day.d, 26) + ' tháng ' + bl(day.m, 26) + ' năm ' + bl(day.y, 50) + '</div>';
      }


      /* ================= FORMS CONFIG ================= */
      var GENDER_OPTS = ['Nam', 'Nữ'];
      var YN = ['Có', 'Không'];

      var FORMS = [

        /* 1 -------------------------------------------------- */
        {
          id: 'khai-sinh', num: 1, group: 'Đăng ký lần đầu',
          title: 'Tờ khai đăng ký khai sinh',
          docTitle: 'TỜ KHAI ĐĂNG KÝ KHAI SINH',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3', placeholder: 'CCCD số ... cấp ngày .../.../... do ... cấp' }),
            SEL('quanHe', 'Quan hệ với người được khai sinh', ['Bản thân', 'Cha', 'Mẹ', 'Người giám hộ', 'Khác']),
            SEC('Người được khai sinh'),
            T('c_hoTen', 'Họ, chữ đệm, tên'),
            D('c_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('c_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('c_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('c_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('c_noiSinh', 'Nơi sinh', { note: '4' }),
            T('c_queQuan', 'Quê quán'),
            SEC('Thông tin mẹ'),
            T('me_hoTen', 'Họ, chữ đệm, tên mẹ'),
            D('me_ngaySinh', 'Ngày, tháng, năm sinh mẹ'),
            T('me_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('me_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('me_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Thông tin cha'),
            T('cha_hoTen', 'Họ, chữ đệm, tên cha'),
            D('cha_ngaySinh', 'Ngày, tháng, năm sinh cha'),
            T('cha_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('cha_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('cha_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '6' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += personLine(v, 'yc', { dob: false, gender: false, residence: true, paper: true });
            // fix: requester line doesn't need dân tộc/quốc tịch row; rebuild manually
            out = ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen) +
              ln('Nơi cư trú', v.yc_noiCuTru, '2') +
              ln('Giấy tờ tùy thân', v.yc_giayTo, '3') +
              ln('Quan hệ với người được khai sinh', v.quanHe);
            out += para('Đề nghị cơ quan đăng ký khai sinh cho người dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.c_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.c_ngaySinh ? fmtDateSlash(v.c_ngaySinh) : '', null, 110);
            out += '<div class="fline" style="font-style:italic;color:var(--muted);">' + (v.c_ngaySinh ? dateInWords(v.c_ngaySinh) : '&nbsp;') + '</div>';
            out += lnrow([['Giới tính', v.c_gioiTinh, 60], ['Dân tộc', v.c_danToc, 70], ['Quốc tịch', v.c_quocTich, 90]]);
            out += ln('Nơi sinh', v.c_noiSinh, '4');
            out += ln('Quê quán', v.c_queQuan);
            out += ln('Họ, chữ đệm, tên người mẹ', v.me_hoTen);
            out += lnrow([['Ngày, tháng, năm sinh', v.me_ngaySinh ? fmtDateSlash(v.me_ngaySinh) : '', 110], ['Dân tộc', v.me_danToc, 70], ['Quốc tịch', v.me_quocTich, 90]]);
            out += ln('Nơi cư trú', v.me_noiCuTru, '2');
            out += ln('Họ, chữ đệm, tên người cha', v.cha_hoTen);
            out += lnrow([['Ngày, tháng, năm sinh', v.cha_ngaySinh ? fmtDateSlash(v.cha_ngaySinh) : '', 110], ['Dân tộc', v.cha_danToc, 70], ['Quốc tịch', v.cha_quocTich, 90]]);
            out += ln('Nơi cư trú', v.cha_noiCuTru, '2');
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '6'); }
        },

        /* 2 -------------------------------------------------- */
        {
          id: 'ket-hon', num: 2, group: 'Đăng ký lần đầu',
          title: 'Tờ khai đăng ký kết hôn',
          docTitle: 'TỜ KHAI ĐĂNG KÝ KẾT HÔN',
          fields: [
            SEC('Bên nữ'),
            T('nu_hoTen', 'Họ, chữ đệm, tên (bên nữ)'),
            D('nu_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('nu_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('nu_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('nu_noiCuTru', 'Nơi cư trú', { note: '4' }),
            T('nu_giayTo', 'Giấy tờ tùy thân', { note: '5' }),
            SEL('nu_lanKetHon', 'Kết hôn lần thứ mấy', ['Lần thứ nhất', 'Lần thứ hai', 'Lần thứ ba', 'Khác']),
            SEC('Bên nam'),
            T('nam_hoTen', 'Họ, chữ đệm, tên (bên nam)'),
            D('nam_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('nam_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('nam_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('nam_noiCuTru', 'Nơi cư trú', { note: '4' }),
            T('nam_giayTo', 'Giấy tờ tùy thân', { note: '5' }),
            SEL('nam_lanKetHon', 'Kết hôn lần thứ mấy', ['Lần thứ nhất', 'Lần thứ hai', 'Lần thứ ba', 'Khác']),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '6' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'double',
          signerNames: function (v) { return [v.nu_hoTen, v.nam_hoTen]; },
          signerLabels: ['Bên nữ', 'Bên nam'],
          body: function (v) {
            var col = function (p) {
              return ln('Họ, chữ đệm, tên', v[p + '_hoTen']) +
                ln('Ngày, tháng, năm sinh', v[p + '_ngaySinh'] ? fmtDateSlash(v[p + '_ngaySinh']) : '', null, 110) +
                lnrow([['Dân tộc', v[p + '_danToc'], 70], ['Quốc tịch', v[p + '_quocTich'], 90]]) +
                ln('Nơi cư trú', v[p + '_noiCuTru'], '4') +
                ln('Giấy tờ tùy thân', v[p + '_giayTo'], '5') +
                ln('Kết hôn lần thứ mấy', v[p + '_lanKetHon']);
            };
            var out = '<div class="twocol"><div><div class="colhd">Bên nữ</div>' + col('nu') + '</div><div><div class="colhd">Bên nam</div>' + col('nam') + '</div></div>';
            return out;
          },
          camDoanText: 'Chúng tôi cam đoan những lời khai trên đây là đúng sự thật, việc kết hôn của chúng tôi là tự nguyện, không vi phạm quy định của Luật hôn nhân và gia đình Việt Nam. Chúng tôi chịu hoàn toàn trách nhiệm trước pháp luật về nội dung cam đoan của mình. Đề nghị Quý cơ quan đăng ký.',
          afterCamDoan: function (v) { return copyRequestLine(v, '6'); }
        },

        /* 3 -------------------------------------------------- */
        {
          id: 'khai-tu', num: 3, group: 'Đăng ký lần đầu',
          title: 'Tờ khai đăng ký khai tử',
          docTitle: 'TỜ KHAI ĐĂNG KÝ KHAI TỬ',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người đã chết'),
            SEC('Người đã chết'),
            T('nc_hoTen', 'Họ, chữ đệm, tên'),
            D('nc_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('nc_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('nc_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('nc_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('nc_noiCuTru', 'Nơi cư trú cuối cùng', { note: '2' }),
            T('nc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Thông tin về việc chết'),
            T('gio', 'Giờ chết', { width: 'small' }),
            T('phut', 'Phút', { width: 'small' }),
            D('ngayChet', 'Ngày chết'),
            T('noiChet', 'Nơi chết'),
            T('nguyenNhan', 'Nguyên nhân chết'),
            T('soGiayBaoTu', 'Số Giấy báo tử / giấy tờ thay thế', { note: '4' }),
            T('doCoQuan', 'Do cơ quan cấp'),
            D('ngayCapGiayBaoTu', 'Ngày cấp'),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '5' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người đã chết', v.quanHe);
            out += para('Đề nghị cơ quan đăng ký khai tử cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.nc_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.nc_ngaySinh ? fmtDateSlash(v.nc_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.nc_gioiTinh, 60], ['Dân tộc', v.nc_danToc, 70], ['Quốc tịch', v.nc_quocTich, 90]]);
            out += ln('Nơi cư trú cuối cùng', v.nc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.nc_giayTo, '3');
            out += '<div class="fline">Đã chết vào lúc: ' + bl(v.gio, 26) + ' giờ ' + bl(v.phut, 26) + ' phút, ngày ' + bl(v.ngayChet ? fmtDate(v.ngayChet).d : '', 24) + ' tháng ' + bl(v.ngayChet ? fmtDate(v.ngayChet).m : '', 24) + ' năm ' + bl(v.ngayChet ? fmtDate(v.ngayChet).y : '', 44) + '</div>';
            out += ln('Nơi chết', v.noiChet);
            out += ln('Nguyên nhân chết', v.nguyenNhan);
            out += ln('Số Giấy báo tử/Giấy tờ thay thế', v.soGiayBaoTu, '4');
            out += ln('Do', v.doCoQuan);
            out += ln('Cấp ngày', v.ngayCapGiayBaoTu ? fmtDateSlash(v.ngayCapGiayBaoTu) : '', null, 110);
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '5'); }
        },

        /* 4 -------------------------------------------------- */
        {
          id: 'giam-ho', num: 4, group: 'Đăng ký lần đầu',
          title: 'Tờ khai đăng ký giám hộ',
          docTitle: 'TỜ KHAI ĐĂNG KÝ GIÁM HỘ',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Người giám hộ'),
            T('gh_hoTen', 'Họ, chữ đệm, tên người giám hộ'),
            T('gh_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('gh_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Người được giám hộ'),
            T('dgh_hoTen', 'Họ, chữ đệm, tên'),
            D('dgh_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('dgh_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('dgh_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('dgh_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('dgh_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('dgh_giayTo', 'Giấy khai sinh/Giấy tờ tùy thân'),
            TA('lyDo', 'Lý do đăng ký giám hộ', { wide: true }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += para('Đề nghị cơ quan đăng ký việc giám hộ giữa những người có tên dưới đây:');
            out += sectionHd('Người giám hộ:');
            out += ln('Họ, chữ đệm, tên', v.gh_hoTen);
            out += ln('Nơi cư trú', v.gh_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.gh_giayTo, '3');
            out += sectionHd('Người được giám hộ:');
            out += ln('Họ, chữ đệm, tên', v.dgh_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.dgh_ngaySinh ? fmtDateSlash(v.dgh_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.dgh_gioiTinh, 60], ['Dân tộc', v.dgh_danToc, 70], ['Quốc tịch', v.dgh_quocTich, 90]]);
            out += ln('Nơi cư trú', v.dgh_noiCuTru, '2');
            out += ln('Giấy khai sinh/Giấy tờ tùy thân', v.dgh_giayTo);
            out += ln('Lý do đăng ký giám hộ', v.lyDo);
            return out;
          }
        },

        /* 5 -------------------------------------------------- */
        {
          id: 'cham-dut-giam-ho', num: 5, group: 'Đăng ký lần đầu',
          title: 'Tờ khai đăng ký chấm dứt giám hộ',
          docTitle: 'TỜ KHAI ĐĂNG KÝ CHẤM DỨT GIÁM HỘ',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Người giám hộ'),
            T('gh_hoTen', 'Họ, chữ đệm, tên'),
            D('gh_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('gh_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('gh_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('gh_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('gh_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Người được giám hộ'),
            T('dgh_hoTen', 'Họ, chữ đệm, tên'),
            T('dgh_noiCuTru', 'Nơi cư trú'),
            T('dgh_giayTo', 'Giấy khai sinh/Giấy tờ tùy thân'),
            SEC('Thông tin đã đăng ký giám hộ'),
            T('daDangKyTai', 'Đã đăng ký giám hộ tại'),
            T('quyenSo', 'Quyển số'),
            TA('lyDo', 'Lý do chấm dứt việc giám hộ', { wide: true }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += para('Đề nghị cơ quan đăng ký chấm dứt việc giám hộ giữa:');
            out += sectionHd('Người giám hộ:');
            out += ln('Họ, chữ đệm, tên', v.gh_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.gh_ngaySinh ? fmtDateSlash(v.gh_ngaySinh) : '', null, 110);
            out += lnrow([['Dân tộc', v.gh_danToc, 70], ['Quốc tịch', v.gh_quocTich, 90]]);
            out += ln('Nơi cư trú', v.gh_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.gh_giayTo, '3');
            out += sectionHd('Người được giám hộ:');
            out += ln('Họ, chữ đệm, tên', v.dgh_hoTen);
            out += ln('Nơi cư trú', v.dgh_noiCuTru);
            out += ln('Giấy khai sinh/Giấy tờ tùy thân', v.dgh_giayTo);
            out += ln('Đã đăng ký giám hộ tại', v.daDangKyTai);
            out += ln('Quyển số', v.quyenSo, null, 60);
            out += ln('Lý do chấm dứt việc giám hộ', v.lyDo);
            return out;
          }
        },

        /* 6 -------------------------------------------------- */
        {
          id: 'nhan-cha-me-con', num: 6, group: 'Đăng ký lần đầu',
          title: 'Tờ khai đăng ký nhận cha, mẹ, con',
          docTitle: 'TỜ KHAI ĐĂNG KÝ NHẬN CHA, MẸ, CON',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người nhận cha/mẹ/con', { note: '4', placeholder: 'Chỉ khai nếu người khai không đồng thời là người nhận' }),
            SEC('Người được nhận là cha/mẹ/con'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('a_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('a_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('a_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('a_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('a_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEL('quanHeLa', 'Là', ['cha', 'mẹ', 'con']),
            SEC('Của người có tên dưới đây'),
            T('b_hoTen', 'Họ, chữ đệm, tên'),
            D('b_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('b_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('b_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('b_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('b_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('b_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            TA('ykienNguoiKia', 'Ý kiến của người hiện đang là mẹ hoặc cha', { note: '5', wide: true }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người nhận cha/mẹ/con', v.quanHe, '4');
            out += para('Đề nghị cơ quan công nhận người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.a_gioiTinh, 60], ['Dân tộc', v.a_danToc, 70], ['Quốc tịch', v.a_quocTich, 90]]);
            out += ln('Nơi cư trú', v.a_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.a_giayTo, '3');
            out += para('Là ' + (v.quanHeLa ? '<b>' + esc(v.quanHeLa) + '</b>' : bl('', 60)) + ' của người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.b_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.b_ngaySinh ? fmtDateSlash(v.b_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.b_gioiTinh, 60], ['Dân tộc', v.b_danToc, 70], ['Quốc tịch', v.b_quocTich, 90]]);
            out += ln('Nơi cư trú', v.b_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.b_giayTo, '3');
            if (v.ykienNguoiKia) {
              out += sectionHd('Ý kiến của người hiện đang là mẹ hoặc cha:');
              out += para(esc(v.ykienNguoiKia));
            }
            return out;
          },
          camDoanText: 'Tôi cam đoan việc nhận nói trên là đúng sự thật, tự nguyện, không có tranh chấp và chịu trách nhiệm trước pháp luật về cam đoan của mình.'
        },

        /* 7 -------------------------------------------------- */
        {
          id: 'ghi-so-khai-sinh', num: 7, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi vào Sổ hộ tịch việc khai sinh',
          docTitle: 'TỜ KHAI GHI VÀO SỔ HỘ TỊCH VIỆC KHAI SINH',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người được ghi vào Sổ hộ tịch'),
            SEC('Người được khai sinh'),
            T('c_hoTen', 'Họ, chữ đệm, tên'),
            D('c_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('c_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('c_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('c_quocTich', 'Quốc tịch'),
            T('c_noiSinh', 'Nơi sinh'),
            T('c_queQuan', 'Quê quán'),
            SEC('Thông tin mẹ'),
            T('me_hoTen', 'Họ, chữ đệm, tên mẹ'),
            T('me_namSinh', 'Năm sinh', { note: '4' }),
            T('me_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('me_quocTich', 'Quốc tịch'),
            T('me_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Thông tin cha'),
            T('cha_hoTen', 'Họ, chữ đệm, tên cha'),
            T('cha_namSinh', 'Năm sinh', { note: '4' }),
            T('cha_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('cha_quocTich', 'Quốc tịch'),
            T('cha_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Đăng ký tại nước ngoài'),
            T('daDangKyTai', 'Đã được đăng ký khai sinh tại', { note: '5' }),
            T('giayKhaiSinhSo', 'Giấy khai sinh số', { note: '6' }),
            D('ngayCap', 'Cấp ngày'),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người được ghi vào Sổ hộ tịch việc khai sinh', v.quanHe);
            out += para('Đề nghị cơ quan ghi vào Sổ hộ tịch việc khai sinh cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.c_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.c_ngaySinh ? fmtDateSlash(v.c_ngaySinh) : '', null, 110);
            out += '<div class="fline" style="font-style:italic;color:var(--muted);">' + (v.c_ngaySinh ? dateInWords(v.c_ngaySinh) : '&nbsp;') + '</div>';
            out += lnrow([['Giới tính', v.c_gioiTinh, 60], ['Dân tộc', v.c_danToc, 70], ['Quốc tịch', v.c_quocTich, 90]]);
            out += ln('Nơi sinh', v.c_noiSinh);
            out += ln('Quê quán', v.c_queQuan);
            out += ln('Họ, chữ đệm, tên người mẹ', v.me_hoTen);
            out += lnrow([['Năm sinh', v.me_namSinh, 50], ['Dân tộc', v.me_danToc, 70], ['Quốc tịch', v.me_quocTich, 90]]);
            out += ln('Nơi cư trú', v.me_noiCuTru, '2');
            out += ln('Họ, chữ đệm, tên người cha', v.cha_hoTen);
            out += lnrow([['Năm sinh', v.cha_namSinh, 50], ['Dân tộc', v.cha_danToc, 70], ['Quốc tịch', v.cha_quocTich, 90]]);
            out += ln('Nơi cư trú', v.cha_noiCuTru, '2');
            out += ln('Đã được đăng ký khai sinh tại', v.daDangKyTai, '5');
            out += lnT(ln('Giấy khai sinh số', v.giayKhaiSinhSo, '6', 100), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            return out;
          }
        },

        /* 8 -------------------------------------------------- */
        {
          id: 'ghi-chu-ket-hon', num: 8, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi chú kết hôn',
          docTitle: 'TỜ KHAI GHI CHÚ KẾT HÔN',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Đăng ký kết hôn tại nước ngoài'),
            T('daDangKyTai', 'Đã đăng ký kết hôn tại', { note: '4' }),
            T('so', 'Số'),
            D('ngayCap', 'Cấp ngày'),
            TA('tinhTrangTruoc', 'Tình trạng hôn nhân trước khi kết hôn lần này', { note: '5', wide: true, placeholder: 'Chưa từng kết hôn / đã từng kết hôn nhưng hôn nhân đã chấm dứt' }),
            SEC('Bên nữ'),
            T('nu_hoTen', 'Họ, chữ đệm, tên (bên nữ)'),
            D('nu_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('nu_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('nu_quocTich', 'Quốc tịch'),
            T('nu_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('nu_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Bên nam'),
            T('nam_hoTen', 'Họ, chữ đệm, tên (bên nam)'),
            D('nam_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('nam_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('nam_quocTich', 'Quốc tịch'),
            T('nam_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('nam_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += para('Đề nghị cơ quan ghi vào sổ việc kết hôn sau đây:');
            out += ln('Đã đăng ký kết hôn tại', v.daDangKyTai, '4');
            out += lnT(ln('Số', v.so, null, 60), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            if (v.tinhTrangTruoc) { out += para('Trước khi kết hôn lần này: ' + esc(v.tinhTrangTruoc)); }
            var col = function (p) {
              return ln('Họ, chữ đệm, tên', v[p + '_hoTen']) +
                ln('Ngày, tháng, năm sinh', v[p + '_ngaySinh'] ? fmtDateSlash(v[p + '_ngaySinh']) : '', null, 110) +
                lnrow([['Dân tộc', v[p + '_danToc'], 70], ['Quốc tịch', v[p + '_quocTich'], 90]]) +
                ln('Nơi cư trú', v[p + '_noiCuTru'], '2') +
                ln('Giấy tờ tùy thân', v[p + '_giayTo'], '3');
            };
            out += '<div class="twocol"><div><div class="colhd">Bên nữ</div>' + col('nu') + '</div><div><div class="colhd">Bên nam</div>' + col('nam') + '</div></div>';
            return out;
          }
        },

        /* 9 -------------------------------------------------- */
        {
          id: 'ghi-chu-ly-hon', num: 9, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi chú ly hôn',
          docTitle: 'TỜ KHAI GHI CHÚ LY HÔN',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người được ghi chú'),
            SEL('loaiViec', 'Loại việc', ['Ly hôn', 'Hủy việc kết hôn'], { note: '4' }),
            SEC('Người thứ nhất (được ghi chú)'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('a_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('a_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('a_quocTich', 'Quốc tịch'),
            T('a_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('a_noiCuTruHienNay', 'Nơi cư trú hiện nay', { note: '2' }),
            T('a_noiCuTruTruocXuatCanh', 'Nơi cư trú trước khi xuất cảnh'),
            T('noiDangKyKetHonTruoc', 'Nơi đăng ký kết hôn trước đây'),
            SEC('Đã ly hôn/hủy kết hôn với'),
            T('b_hoTen', 'Họ, chữ đệm, tên'),
            D('b_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('b_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('b_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('b_quocTich', 'Quốc tịch'),
            T('b_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Căn cứ giải quyết'),
            T('theoGiayTo', 'Theo (loại giấy tờ)', { note: '5', placeholder: 'Bản án/Quyết định/Thỏa thuận...' }),
            T('so', 'Số giấy tờ'),
            T('doCoQuan', 'Do cơ quan nước ngoài', { note: '6' }),
            D('ngayCap', 'Cấp ngày'),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '7' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người được ghi chú', v.quanHe);
            out += para('Đề nghị ghi vào sổ hộ tịch việc <b>' + esc(v.loaiViec || '') + '</b> đã được giải quyết tại cơ quan có thẩm quyền của nước ngoài cho người dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.a_gioiTinh, 60], ['Dân tộc', v.a_danToc, 70], ['Quốc tịch', v.a_quocTich, 90]]);
            out += ln('Giấy tờ tùy thân', v.a_giayTo, '3');
            out += ln('Nơi cư trú hiện nay', v.a_noiCuTruHienNay, '2');
            out += ln('Nơi cư trú trước khi xuất cảnh', v.a_noiCuTruTruocXuatCanh);
            out += ln('Nơi đăng ký kết hôn trước đây', v.noiDangKyKetHonTruoc);
            out += para('Đã ' + (v.loaiViec === 'Hủy việc kết hôn' ? 'hủy kết hôn' : 'ly hôn') + ' với ông/bà:');
            out += ln('Họ, chữ đệm, tên', v.b_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.b_ngaySinh ? fmtDateSlash(v.b_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.b_gioiTinh, 60], ['Dân tộc', v.b_danToc, 70], ['Quốc tịch', v.b_quocTich, 90]]);
            out += ln('Giấy tờ tùy thân', v.b_giayTo, '3');
            out += lnT(ln('Theo', v.theoGiayTo, '5'), ' số ' + bl(v.so, 90));
            out += lnT(ln('Do', v.doCoQuan, '6'), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '7'); }
        },

        /* 10 -------------------------------------------------- */
        {
          id: 'ghi-so-khai-tu', num: 10, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi vào Sổ hộ tịch việc khai tử',
          docTitle: 'TỜ KHAI GHI VÀO SỔ HỘ TỊCH VIỆC KHAI TỬ',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người đã chết'),
            SEC('Người đã chết'),
            T('nc_hoTen', 'Họ, chữ đệm, tên'),
            D('nc_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('nc_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('nc_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('nc_quocTich', 'Quốc tịch'),
            T('nc_noiCuTru', 'Nơi cư trú cuối cùng', { note: '2' }),
            T('nc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('gio', 'Giờ chết'), T('phut', 'Phút'),
            D('ngayChet', 'Ngày chết'),
            T('noiChet', 'Nơi chết'),
            T('nguyenNhan', 'Nguyên nhân chết'),
            SEC('Căn cứ giải quyết'),
            T('theoGiayTo', 'Theo (loại giấy tờ)', { note: '4' }),
            T('so', 'Số'),
            T('doCoQuan', 'Do cơ quan nước ngoài', { note: '5' }),
            D('ngayCap', 'Cấp ngày'),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '6' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người đã chết', v.quanHe);
            out += para('Đề nghị cơ quan ghi vào Sổ hộ tịch việc khai tử cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.nc_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.nc_ngaySinh ? fmtDateSlash(v.nc_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.nc_gioiTinh, 60], ['Dân tộc', v.nc_danToc, 70], ['Quốc tịch', v.nc_quocTich, 90]]);
            out += ln('Nơi cư trú cuối cùng', v.nc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.nc_giayTo, '3');
            out += '<div class="fline">Đã chết vào lúc: ' + bl(v.gio, 26) + ' giờ ' + bl(v.phut, 26) + ' phút, ngày ' + bl(v.ngayChet ? fmtDate(v.ngayChet).d : '', 24) + ' tháng ' + bl(v.ngayChet ? fmtDate(v.ngayChet).m : '', 24) + ' năm ' + bl(v.ngayChet ? fmtDate(v.ngayChet).y : '', 44) + '</div>';
            out += ln('Nơi chết', v.noiChet);
            out += ln('Nguyên nhân chết', v.nguyenNhan);
            out += lnT(ln('Theo', v.theoGiayTo, '4'), ' số ' + bl(v.so, 90));
            out += lnT(ln('Do', v.doCoQuan, '5'), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '6'); }
        },

        /* 11 -------------------------------------------------- */
        {
          id: 'ghi-so-nuoi-con-nuoi', num: 11, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi vào Sổ hộ tịch việc nuôi con nuôi',
          docTitle: 'TỜ KHAI GHI VÀO SỔ HỘ TỊCH VIỆC NUÔI CON NUÔI',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Con nuôi'),
            T('cn_hoTen', 'Họ, chữ đệm, tên'),
            D('cn_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('cn_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('cn_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('cn_quocTich', 'Quốc tịch'),
            T('cn_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('cn_giayTo', 'Giấy khai sinh/Giấy tờ tùy thân', { note: '3' }),
            SEC('Cha mẹ nuôi'),
            T('me_hoTen', 'Họ, chữ đệm, tên mẹ'),
            D('me_ngaySinh', 'Ngày, tháng, năm sinh mẹ'),
            T('me_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('me_quocTich', 'Quốc tịch'),
            T('me_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('cha_hoTen', 'Họ, chữ đệm, tên cha'),
            D('cha_ngaySinh', 'Ngày, tháng, năm sinh cha'),
            T('cha_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('cha_quocTich', 'Quốc tịch'),
            T('cha_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Căn cứ giải quyết'),
            T('theoGiayTo', 'Theo (loại giấy tờ)', { note: '4' }),
            T('so', 'Số'),
            T('doCoQuan', 'Do cơ quan nước ngoài', { note: '5' }),
            D('ngayCap', 'Cấp ngày'),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '6' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += para('Đề nghị cơ quan ghi vào Sổ hộ tịch việc nuôi con nuôi cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.cn_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.cn_ngaySinh ? fmtDateSlash(v.cn_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.cn_gioiTinh, 60], ['Dân tộc', v.cn_danToc, 70], ['Quốc tịch', v.cn_quocTich, 90]]);
            out += ln('Nơi cư trú', v.cn_noiCuTru, '2');
            out += ln('Giấy khai sinh/Giấy tờ tùy thân', v.cn_giayTo, '3');
            out += para('Là con nuôi của:');
            out += ln('Họ, chữ đệm, tên mẹ', v.me_hoTen);
            out += lnrow([['Ngày, tháng, năm sinh', v.me_ngaySinh ? fmtDateSlash(v.me_ngaySinh) : '', 110], ['Dân tộc', v.me_danToc, 70], ['Quốc tịch', v.me_quocTich, 90]]);
            out += ln('Nơi cư trú', v.me_noiCuTru, '2');
            out += ln('Họ, chữ đệm, tên cha', v.cha_hoTen);
            out += lnrow([['Ngày, tháng, năm sinh', v.cha_ngaySinh ? fmtDateSlash(v.cha_ngaySinh) : '', 110], ['Dân tộc', v.cha_danToc, 70], ['Quốc tịch', v.cha_quocTich, 90]]);
            out += ln('Nơi cư trú', v.cha_noiCuTru, '2');
            out += lnT(ln('Theo', v.theoGiayTo, '4'), ' số ' + bl(v.so, 90));
            out += lnT(ln('Do', v.doCoQuan, '5'), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '6'); }
        },

        /* 12 -------------------------------------------------- */
        {
          id: 'ghi-so-giam-ho-nhan-cmc', num: 12, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi vào Sổ hộ tịch việc giám hộ, nhận cha, mẹ, con',
          docTitle: 'TỜ KHAI GHI VÀO SỔ HỘ TỊCH VIỆC GIÁM HỘ, NHẬN CHA, MẸ, CON',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('loaiViec', 'Loại việc hộ tịch (giám hộ / nhận cha, mẹ, con)', { note: '4' }),
            SEC('Người thứ nhất'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('a_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('a_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('a_quocTich', 'Quốc tịch'),
            T('a_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('a_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEL('quanHeLa', 'Là', ['cha', 'mẹ', 'con', 'người giám hộ'], { note: '5' }),
            SEC('Của người thứ hai'),
            T('b_hoTen', 'Họ, chữ đệm, tên'),
            D('b_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('b_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('b_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('b_quocTich', 'Quốc tịch'),
            T('b_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('b_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Căn cứ giải quyết'),
            T('theoGiayTo', 'Theo (loại giấy tờ)', { note: '6' }),
            T('so', 'Số'),
            T('doCoQuan', 'Do cơ quan nước ngoài', { note: '7' }),
            D('ngayCap', 'Cấp ngày'),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '8' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += para('Đề nghị cơ quan ghi vào Sổ hộ tịch việc <b>' + esc(v.loaiViec || '') + '</b> cho người dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.a_gioiTinh, 60], ['Dân tộc', v.a_danToc, 70], ['Quốc tịch', v.a_quocTich, 90]]);
            out += ln('Nơi cư trú', v.a_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.a_giayTo, '3');
            out += para('Là ' + (v.quanHeLa ? '<b>' + esc(v.quanHeLa) + '</b>' : bl('', 60)) + ' của người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.b_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.b_ngaySinh ? fmtDateSlash(v.b_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.b_gioiTinh, 60], ['Dân tộc', v.b_danToc, 70], ['Quốc tịch', v.b_quocTich, 90]]);
            out += ln('Nơi cư trú', v.b_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.b_giayTo, '3');
            out += lnT(ln('Đã được giải quyết theo', v.theoGiayTo, '6'), ' số ' + bl(v.so, 90));
            out += lnT(ln('Do', v.doCoQuan, '7'), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '8'); }
        },

        /* 13 -------------------------------------------------- */
        {
          id: 'ghi-so-khac', num: 13, group: 'Ghi vào Sổ hộ tịch (việc đã đăng ký ở nước ngoài)',
          title: 'Tờ khai ghi vào Sổ hộ tịch các việc hộ tịch khác',
          docTitle: 'TỜ KHAI GHI VÀO SỔ HỘ TỊCH CÁC VIỆC HỘ TỊCH KHÁC',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('loaiViec', 'Loại việc hộ tịch', { note: '4', placeholder: 'Ví dụ: thay đổi hộ tịch' }),
            SEC('Người có tên trong việc hộ tịch'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('a_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('a_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('a_quocTich', 'Quốc tịch'),
            T('a_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('a_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            TA('noiDung', 'Nội dung ghi vào sổ hộ tịch', { note: '4', wide: true }),
            SEC('Căn cứ giải quyết'),
            T('theoGiayTo', 'Theo (loại giấy tờ)', { note: '5' }),
            T('so', 'Số'),
            T('doCoQuan', 'Do cơ quan nước ngoài', { note: '6' }),
            D('ngayCap', 'Cấp ngày'),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '7' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += para('Đề nghị cơ quan ghi vào Sổ hộ tịch việc <b>' + esc(v.loaiViec || '') + '</b> cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.a_gioiTinh, 60], ['Dân tộc', v.a_danToc, 70], ['Quốc tịch', v.a_quocTich, 90]]);
            out += ln('Nơi cư trú', v.a_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.a_giayTo, '3');
            out += ln('Nội dung ghi vào sổ hộ tịch', v.noiDung, '4');
            out += lnT(ln('Theo', v.theoGiayTo, '5'), ' số ' + bl(v.so, 90));
            out += lnT(ln('Do', v.doCoQuan, '6'), ' cấp ngày ' + bl(v.ngayCap ? fmtDateSlash(v.ngayCap) : '', 110));
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '7'); }
        },

        /* 14 -------------------------------------------------- */
        {
          id: 'dang-ky-lai-khai-sinh', num: 14, group: 'Đăng ký lại',
          title: 'Tờ khai đăng ký lại khai sinh',
          docTitle: 'TỜ KHAI ĐĂNG KÝ LẠI KHAI SINH',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người được khai sinh'),
            SEC('Người được khai sinh'),
            T('c_hoTen', 'Họ, chữ đệm, tên'),
            D('c_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('c_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('c_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('c_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('c_queQuan', 'Quê quán'),
            SEC('Thông tin mẹ'),
            T('me_hoTen', 'Họ, chữ đệm, tên mẹ'),
            T('me_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Thông tin cha'),
            T('cha_hoTen', 'Họ, chữ đệm, tên cha'),
            T('cha_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Đăng ký khai sinh trước đây'),
            T('daDangKyTai', 'Đã đăng ký khai sinh tại', { note: '4' }),
            T('giayKhaiSinhSo', 'Giấy khai sinh số'),
            D('ngayCapCu', 'Ngày cấp'),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người được khai sinh', v.quanHe);
            out += para('Đề nghị cơ quan đăng ký lại khai sinh cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.c_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.c_ngaySinh ? fmtDateSlash(v.c_ngaySinh) : '', null, 110);
            out += '<div class="fline" style="font-style:italic;color:var(--muted);">' + (v.c_ngaySinh ? dateInWords(v.c_ngaySinh) : '&nbsp;') + '</div>';
            out += lnrow([['Giới tính', v.c_gioiTinh, 60], ['Dân tộc', v.c_danToc, 70], ['Quốc tịch', v.c_quocTich, 90]]);
            out += ln('Quê quán', v.c_queQuan);
            out += ln('Họ, chữ đệm, tên cha', v.cha_hoTen);
            out += ln('Nơi cư trú', v.cha_noiCuTru, '2');
            out += ln('Họ, chữ đệm, tên mẹ', v.me_hoTen);
            out += ln('Nơi cư trú', v.me_noiCuTru, '2');
            out += ln('Đã đăng ký khai sinh tại', v.daDangKyTai, '4');
            out += lnT(ln('Giấy khai sinh số', v.giayKhaiSinhSo, null, 90), ', ngày cấp ' + bl(v.ngayCapCu ? fmtDateSlash(v.ngayCapCu) : '', 110));
            return out;
          }
        },

        /* 15 -------------------------------------------------- */
        {
          id: 'dang-ky-lai-ket-hon', num: 15, group: 'Đăng ký lại',
          title: 'Tờ khai đăng ký lại kết hôn',
          docTitle: 'TỜ KHAI ĐĂNG KÝ LẠI KẾT HÔN',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            SEC('Vợ'),
            T('vo_hoTen', 'Họ, chữ đệm, tên của vợ'),
            D('vo_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('vo_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('vo_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('vo_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('vo_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Chồng'),
            T('chong_hoTen', 'Họ, chữ đệm, tên của chồng'),
            D('chong_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('chong_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('chong_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('chong_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('chong_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Kết hôn trước đây'),
            T('daDangKyTai', 'Đã đăng ký kết hôn tại', { note: '4' }),
            D('ngayDangKyCu', 'Ngày đăng ký trước đây'),
            T('giayChungNhanSo', 'Giấy chứng nhận kết hôn số', { note: '5' }),
            T('quyenSo', 'Quyển số', { note: '5' }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += para('Đề nghị cơ quan đăng ký lại kết hôn theo nội dung dưới đây:');
            out += ln('Họ, chữ đệm, tên của vợ', v.vo_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.vo_ngaySinh ? fmtDateSlash(v.vo_ngaySinh) : '', null, 110);
            out += lnrow([['Dân tộc', v.vo_danToc, 70], ['Quốc tịch', v.vo_quocTich, 90]]);
            out += ln('Nơi cư trú', v.vo_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.vo_giayTo, '3');
            out += ln('Họ, chữ đệm, tên của chồng', v.chong_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.chong_ngaySinh ? fmtDateSlash(v.chong_ngaySinh) : '', null, 110);
            out += lnrow([['Dân tộc', v.chong_danToc, 70], ['Quốc tịch', v.chong_quocTich, 90]]);
            out += ln('Nơi cư trú', v.chong_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.chong_giayTo, '3');
            out += lnT(ln('Đã đăng ký kết hôn tại', v.daDangKyTai, '4'), ' ngày ' + bl(v.ngayDangKyCu ? fmtDateSlash(v.ngayDangKyCu) : '', 110));
            out += lnT(ln('Theo Giấy chứng nhận kết hôn số', v.giayChungNhanSo, '5', 90), ', Quyển số ' + bl(v.quyenSo, 60));
            return out;
          }
        },

        /* 16 -------------------------------------------------- */
        {
          id: 'dang-ky-lai-khai-tu', num: 16, group: 'Đăng ký lại',
          title: 'Tờ khai đăng ký lại khai tử',
          docTitle: 'TỜ KHAI ĐĂNG KÝ LẠI KHAI TỬ',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người đã chết'),
            SEC('Người đã chết'),
            T('nc_hoTen', 'Họ, chữ đệm, tên'),
            D('nc_ngaySinh', 'Ngày, tháng, năm sinh'),
            T('gio', 'Giờ chết'), T('phut', 'Phút'),
            D('ngayChet', 'Ngày chết'),
            T('noiChet', 'Nơi chết'),
            SEC('Khai tử trước đây'),
            T('daDangKyTai', 'Đã đăng ký khai tử tại', { note: '4' }),
            D('ngayDangKyCu', 'Ngày đăng ký trước đây'),
            T('trichLucSo', 'Trích lục khai tử số'),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người đã chết', v.quanHe);
            out += para('Đề nghị cơ quan đăng ký lại khai tử cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.nc_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.nc_ngaySinh ? fmtDateSlash(v.nc_ngaySinh) : '', null, 110);
            out += '<div class="fline">Đã chết vào lúc: ' + bl(v.gio, 26) + ' giờ ' + bl(v.phut, 26) + ' phút, ngày ' + bl(v.ngayChet ? fmtDate(v.ngayChet).d : '', 24) + ' tháng ' + bl(v.ngayChet ? fmtDate(v.ngayChet).m : '', 24) + ' năm ' + bl(v.ngayChet ? fmtDate(v.ngayChet).y : '', 44) + '</div>';
            out += ln('Nơi chết', v.noiChet);
            out += lnT(ln('Đã đăng ký khai tử tại', v.daDangKyTai, '4'), ' ngày ' + bl(v.ngayDangKyCu ? fmtDateSlash(v.ngayDangKyCu) : '', 110));
            out += ln('Trích lục khai tử số', v.trichLucSo);
            return out;
          }
        },

        /* 17 -------------------------------------------------- */
        {
          id: 'thay-doi-cai-chinh', num: 17, group: 'Thủ tục khác',
          title: 'Tờ khai thay đổi, cải chính, bổ sung thông tin hộ tịch, xác định lại dân tộc',
          docTitle: 'TỜ KHAI ĐĂNG KÝ VIỆC THAY ĐỔI, CẢI CHÍNH, BỔ SUNG THÔNG TIN HỘ TỊCH, XÁC ĐỊNH LẠI DÂN TỘC',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người được thay đổi, cải chính'),
            T('loaiViecDeNghi', 'Đề nghị đăng ký việc', { note: '4', placeholder: 'VD: thay đổi họ tên / cải chính năm sinh / xác định lại dân tộc' }),
            SEC('Người được thay đổi, cải chính'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('a_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('a_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('a_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('a_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('a_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Đã đăng ký trước đây'),
            T('daDangKy', 'Đã đăng ký', { note: '5', placeholder: 'VD: khai sinh' }),
            T('taiCoQuan', 'Tại (cơ quan)'),
            D('ngayDangKyCu', 'Ngày đăng ký'),
            T('soCu', 'Số'), T('quyenSoCu', 'Quyển số'),
            TA('noiDungThayDoi', 'Nội dung thay đổi, cải chính, bổ sung', { note: '6', wide: true }),
            TA('lyDo', 'Lý do', { wide: true }),
            SEC('Nơi lập tờ khai & bản sao'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
            R('capBanSao', 'Đề nghị cấp bản sao', YN, { note: '7' }),
            N('soLuongBanSao', 'Số lượng bản sao'),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người được thay đổi, cải chính, xác định lại dân tộc, bổ sung thông tin hộ tịch', v.quanHe);
            out += para('Đề nghị cơ quan đăng ký việc <b>' + esc(v.loaiViecDeNghi || '') + '</b> cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.a_gioiTinh, 60], ['Dân tộc', v.a_danToc, 70], ['Quốc tịch', v.a_quocTich, 90]]);
            out += ln('Nơi cư trú', v.a_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.a_giayTo, '3');
            out += lnT(ln('Đã đăng ký', v.daDangKy, '5'), ' tại ' + bl(v.taiCoQuan, 150) + ', ngày ' + bl(v.ngayDangKyCu ? fmtDateSlash(v.ngayDangKyCu) : '', 100) + ', số ' + bl(v.soCu, 60) + ', Quyển số ' + bl(v.quyenSoCu, 60));
            out += ln('Nội dung', v.noiDungThayDoi, '6');
            out += ln('Lý do', v.lyDo);
            return out;
          },
          afterCamDoan: function (v) { return copyRequestLine(v, '7'); }
        },

        /* 18 -------------------------------------------------- */
        {
          id: 'ban-sao-trich-luc', num: 18, group: 'Thủ tục khác',
          title: 'Tờ khai cấp bản sao trích lục hộ tịch',
          docTitle: 'TỜ KHAI CẤP BẢN SAO TRÍCH LỤC HỘ TỊCH',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('quanHe', 'Quan hệ với người được cấp bản sao Trích lục hộ tịch'),
            T('loaiTrichLuc', 'Đề nghị cấp bản sao trích lục', { note: '4', placeholder: 'VD: khai sinh / kết hôn / khai tử' }),
            SEC('Người được cấp bản sao'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            R('a_gioiTinh', 'Giới tính', GENDER_OPTS),
            T('a_danToc', 'Dân tộc', { default: 'Kinh' }),
            T('a_quocTich', 'Quốc tịch', { default: 'Việt Nam' }),
            T('a_noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('a_giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            T('soDinhDanh', 'Số định danh cá nhân (nếu có)'),
            T('choHoTen', 'Họ tên cha'), T('choNamSinh', 'Năm sinh cha'),
            T('meHoTen', 'Họ tên mẹ'), T('meNamSinh', 'Năm sinh mẹ'),
            SEC('Đã đăng ký tại'),
            T('daDangKyTai', 'Đã đăng ký tại', { note: '5' }),
            D('ngayDangKyCu', 'Ngày đăng ký'),
            T('so', 'Số'), T('quyenSo', 'Quyển số'),
            N('soLuongBanSao', 'Số lượng bản sao yêu cầu cấp', { note: '6' }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '3');
            out += ln('Quan hệ với người được cấp bản sao Trích lục hộ tịch', v.quanHe);
            out += para('Đề nghị cơ quan cấp bản sao trích lục <b>' + esc(v.loaiTrichLuc || '') + '</b> cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += lnrow([['Giới tính', v.a_gioiTinh, 60], ['Dân tộc', v.a_danToc, 70], ['Quốc tịch', v.a_quocTich, 90]]);
            out += ln('Nơi cư trú', v.a_noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.a_giayTo, '3');
            out += ln('Số định danh cá nhân (nếu có)', v.soDinhDanh);
            out += lnrow([['Họ tên cha', v.choHoTen, 140], ['Năm sinh', v.choNamSinh, 50]]);
            out += lnrow([['Họ tên mẹ', v.meHoTen, 140], ['Năm sinh', v.meNamSinh, 50]]);
            out += lnT(ln('Đã đăng ký tại', v.daDangKyTai, '5'), ' ngày ' + bl(v.ngayDangKyCu ? fmtDateSlash(v.ngayDangKyCu) : '', 100) + ' số ' + bl(v.so, 60) + ' Quyển số ' + bl(v.quyenSo, 60));
            out += ln('Số lượng bản sao yêu cầu cấp', v.soLuongBanSao, '6', 50);
            return out;
          }
        },

        /* 19 -------------------------------------------------- */
        {
          id: 'xac-nhan-ttthn', num: 19, group: 'Thủ tục khác',
          title: 'Tờ khai cấp Giấy xác nhận tình trạng hôn nhân',
          docTitle: 'TỜ KHAI CẤP GIẤY XÁC NHẬN TÌNH TRẠNG HÔN NHÂN',
          fields: [
            SEC('Người yêu cầu'),
            T('yc_hoTen', 'Họ, chữ đệm, tên người yêu cầu'),
            T('yc_noiCuTru', 'Nơi cư trú', { note: '1' }),
            T('yc_giayTo', 'Giấy tờ tùy thân', { note: '2' }),
            SEL('quanHe', 'Quan hệ với người được cấp Giấy xác nhận', ['Bản thân', 'Khác']),
            SEC('Người được cấp Giấy xác nhận'),
            T('a_hoTen', 'Họ, chữ đệm, tên'),
            D('a_ngaySinh', 'Ngày, tháng, năm sinh'),
            SEL('tinhTrang', 'Tình trạng hôn nhân', ['Chưa đăng ký kết hôn với ai', 'Đang có vợ hoặc chồng', 'Đã đăng ký kết hôn nhưng đã ly hôn', 'Đã đăng ký kết hôn nhưng vợ/chồng đã chết'], { note: '3' }),
            TA('mucDich', 'Mục đích sử dụng', { note: '4', wide: true, placeholder: 'Nếu dùng để kết hôn: ghi rõ kết hôn với ai (họ tên, ngày sinh, quốc tịch, nơi cư trú), nơi đăng ký kết hôn' }),
            SEC('Nơi lập tờ khai'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập tờ khai', { default: 'today' }),
          ],
          signerMode: 'single',
          signerName: function (v) { return v.yc_hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên người yêu cầu', v.yc_hoTen);
            out += ln('Nơi cư trú', v.yc_noiCuTru, '1');
            out += ln('Giấy tờ tùy thân', v.yc_giayTo, '2');
            out += ln('Quan hệ với người được cấp Giấy xác nhận tình trạng hôn nhân', v.quanHe);
            out += para('Đề nghị cấp Giấy xác nhận tình trạng hôn nhân cho người có tên dưới đây:');
            out += ln('Họ, chữ đệm, tên', v.a_hoTen);
            out += ln('Ngày, tháng, năm sinh', v.a_ngaySinh ? fmtDateSlash(v.a_ngaySinh) : '', null, 110);
            out += ln('Tình trạng hôn nhân', v.tinhTrang, '3');
            out += ln('Mục đích sử dụng Giấy xác nhận tình trạng hôn nhân', v.mucDich, '4');
            return out;
          }
        },

        /* 20 -------------------------------------------------- */
        {
          id: 'ban-cam-doan', num: 20, group: 'Thủ tục khác',
          title: 'Bản cam đoan',
          docTitle: 'BẢN CAM ĐOAN',
          noQuocHieuFirst: true,
          fields: [
            SEC('Người cam đoan'),
            T('hoTen', 'Họ, chữ đệm, tên'),
            D('ngaySinh', 'Ngày, tháng, năm sinh'),
            T('noiCuTru', 'Nơi cư trú', { note: '2' }),
            T('giayTo', 'Giấy tờ tùy thân', { note: '3' }),
            SEC('Nội dung'),
            TA('noiDung', 'Nội dung cam đoan', { wide: true }),
            T('deThucHien', 'Để thực hiện thủ tục'),
            T('taiCoQuan', 'Tại (cơ quan)'),
            SEC('Nơi lập'),
            T('noiLap', 'Làm tại (địa danh)'),
            D('ngayLap', 'Ngày lập', { default: 'today' }),
          ],
          signerMode: 'single',
          signerLabelOverride: 'Người cam đoan',
          signerName: function (v) { return v.hoTen; },
          body: function (v) {
            var out = '';
            out += ln('Họ, chữ đệm, tên', v.hoTen);
            out += ln('Ngày, tháng, năm sinh', v.ngaySinh ? fmtDateSlash(v.ngaySinh) : '', null, 110);
            out += ln('Nơi cư trú', v.noiCuTru, '2');
            out += ln('Giấy tờ tùy thân', v.giayTo, '3');
            out += para('Tôi xin cam đoan nội dung sau đây:');
            out += para(esc(v.noiDung || ''));
            out += ln('Để thực hiện thủ tục', v.deThucHien);
            out += ln('Tại', v.taiCoQuan);
            return out;
          },
          camDoanText: 'Tôi xin chịu trách nhiệm trước pháp luật về nội dung đã cam đoan nêu trên.'
        }

      ];

  // Export helpers and FORMS globally
  window.DIGITS = DIGITS;
  window.readSmall = readSmall;
  window.readYear = readYear;
  window.dateInWords = dateInWords;
  window.fmtDate = fmtDate;
  window.fmtDateSlash = fmtDateSlash;
  window.T = T; window.TA = TA; window.D = D; window.R = R; window.SEL = SEL; window.N = N; window.SEC = SEC;
  window.esc = esc; window.bl = bl; window.ln = ln; window.lnT = lnT; window.lnrow = lnrow; window.para = para; window.sectionHd = sectionHd;
  window.personLine = personLine; window.copyRequestLine = copyRequestLine; window.madeAtLine = madeAtLine;
  window.GENDER_OPTS = GENDER_OPTS; window.YN = YN;
  window.FORMS = FORMS;
})(window);
