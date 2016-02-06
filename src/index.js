/*jshint esnext: true*/

var releases;

// タブを切り替え
const changeTab = function(index) {
  $('#releases > li.is-active').removeClass('is-active');
  $('#releases > li:nth-child(' + (index + 1) + ')').addClass('is-active');

  const tbody = $('#assets > tbody');
  if(releases[index].assets.length > 0) {
    tbody.empty();
    releases[index].assets.forEach(function(val) {
      // テーブルにAssetを追加
      tbody.append('<tr><td>' + val.name + '</td><td>' + val.download_count + '</td></tr>');
    });
  } else {
    tbody.text('There is no assets in the release.');
  }
};

$(function() {
  const storage = localStorage;

  // ページを離れる際にフォームのデータを保存
  $(window).on("beforeunload", function() {
    storage.setItem('accessToken', $('#accessToken').val());
    storage.setItem('nameOfRepo', $('#nameOfRepo').val());
  });

  // フォームを有効化・無効化
  const changeFormState = function(state) {
    $('#nameOfRepo')
      .prop('disabled', !state);
    $('#accessToken')
      .prop('disabled', !state);
    if(state) {
      $('#check')
        .prop('disabled', !state)
        .removeClass('is-loading');
    } else {
      $('#check')
        .prop('disabled', !state)
        .addClass('is-loading');
    }
  };

  // 通知を表示
  const showNotification = function(selector, place, type, message) {
    const html = '<div class="notification is-' + type + '" style="display: none"><button class="delete"></button>' + message + '</div>';

    // 読みにくい? http://qiita.com/chokuryu@github/items/8b9cff5ea92be245b026
    // 最後のnullはエラー起こすけど気にしない。
    ((place === 'after'  ) ? $(selector).after(html)
    :(place === 'before' ) ? $(selector).before(html)
    :(place === 'append' ) ? $(selector).append(html)
    :(place === 'prepend') ? $(selector).prepend(html)
    : null)
      .children('div.notification')
      .slideDown();
  };

  // 保存したフォームのデータを復元
  $('#accessToken').val(storage.getItem('accessToken'));
  $('#nameOfRepo').val(storage.getItem('nameOfRepo'));

  $('#mainForm').submit(function(e) {
    e.preventDefault();

    $('#check')
      .prop('disabled', true)
      .addClass('is-loading');
    const accessToken = $('#accessToken')
      .prop('disabled', true)
      .val();
    const nameOfRepo = $('#nameOfRepo')
      .prop('disabled', true)
      .val();

    $('#result').slideUp();
    $('#releases').empty();
    $('#assets > tbody').empty();

    $.getJSON('https://api.github.com/repos/' + nameOfRepo + '/releases?access_token=' + accessToken)
      .done(function(data) {
        releases = data;
        if(releases.length > 0) {
          releases.forEach(function(val,index) {
            // タブにReleaseを追加
            $('#releases').append('<li' + (index === 0 ? ' class="is-active"' : '') + '><a onclick="changeTab(' + index + ')">' + val.tag_name + '</a></li>');
          });
          changeTab(0);
          $('#result').slideDown();
        } else {
          showNotification('#mainFormSection', 'prepend', 'warning', 'There is no Release in the repository.');
        }
        changeFormState(true);
      })
      .fail(function() {
        showNotification('#mainFormSection', 'prepend', 'danger', 'Failed to fetch data from GitHub API.');
        changeFormState(true);
      });
  });

  // [X]が押されたときに通知を消す
  $(document).on('click', 'div.notification button.delete', function() {
    $(this).closest('div.notification').slideUp(500, function() {
      $(this).remove();
    });
  });
});
