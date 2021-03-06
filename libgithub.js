/**
 * libgithub - JavaScript library for visualizing GitHub data
 * Matt Sparks [http://quadpoint.org]
 *
 * Badge design from github-commit-badge by Johannes 'heipei' Gilger
 */
libgithub = new Object();


libgithub.Badge = function (username, repo, commitId)
{
  this._username = username;
  this._repo = repo;
  this._commitId = (typeof(commitId) == 'undefined') ? 'master' : commitId;
  this._gravatarSize = 60;
  this._startHidden = true;
  this._numCommits = 1;
  this._target = null;

  this.gravatarSize = function () { return this._gravatarSize; };
  this.gravatarSizeIs = function (size) { this._gravatarSize = size; };
  this.startHidden = function () { return this._startHidden; };
  this.startHiddenIs = function (setting) { this._startHidden = setting; };
  this.numCommits = function () { return this._numCommits; };
  this.numCommitsIs = function (numCommits) { this._numCommits = numCommits; };
  this.target = function () { return this._target; };
};


libgithub.Badge.prototype._userRepo = function (commit)
{
  var userRepo = _ce('div', {'class': 'libgithub-badge-username'});
  var link = _ce('a',
    {'href': 'https://github.com/' + this._username + '/' + this._repo,
     'target': '_blank',
     'class': 'libgithub-badge-username'});

  $(link).append(_tn(this._username + '/' + this._repo));
  $(userRepo).append(link);

  return userRepo;
};


libgithub.Badge.prototype._diffLine = function (commit)
{
  var diffLine = _ce('div', {'class': 'libgithub-badge-diffline'});

  var image = _ce('img',
    {'src': _gravatarImageURL(commit.committer.email, this._gravatarSize),
     'class': 'libgithub-badge-gravatar',
     'alt': this._username});
  $(diffLine).append(image);

  var link = _ce('a',
    {'href': 'https://github.com' + commit.url,
     'target': '_blank',
     'class': 'libgithub-badge-commitid'});
  $(link).append(_tn(' ' + _truncate(commit.id, 10, '')));
  $(diffLine).append(_tn(commit.committer.name + ' committed '));

  var niceTime = _niceTime(commit.committed_date);
  var commitDate = _ce('span',
    {'class': 'libgithub-badge-text-date'});
  $(commitDate).append(_tn(niceTime));

  $(diffLine).append(link);
  $(diffLine).append(_tn(' about '));
  $(diffLine).append(commitDate);

  return diffLine;
};


libgithub.Badge.prototype._commitMessage = function (commit)
{
  var commitMessage = _ce('div',
    {'class': 'libgithub-badge-commitmessage'});
  $(commitMessage).append(_tn('"' + _truncate(commit.message, 100) + '"'));

  return commitMessage;
};


libgithub.Badge.prototype._diffStat = function (commit, fileList)
{
  var numAdded = ('added' in commit) ? commit.added.length : 0;
  var numRemoved = ('removed' in commit) ? commit.removed.length : 0;
  var numModified = ('modified' in commit) ? commit.modified.length : 0;

  var diffStat = _ce('div', {'class': 'libgithub-badge-diffstat'});
  var addedElement = _ce('span', {'class': 'libgithub-badge-diffadded'});
  var removedElement = _ce('span', {'class': 'libgithub-badge-diffremoved'});
  var modifiedElement = _ce('span', {'class': 'libgithub-badge-diffmodified'});

  $(diffStat).append(_tn('('));
  $(diffStat).append(_tn(numAdded));
  $(diffStat).append($(addedElement).text(' added'));
  $(diffStat).append(_tn(', '));
  $(diffStat).append(_tn(numRemoved));
  $(diffStat).append($(removedElement).text(' removed'));
  $(diffStat).append(_tn(', '));
  $(diffStat).append(_tn(numModified));
  $(diffStat).append($(modifiedElement).text(' modified'));
  $(diffStat).append(_tn(')'));

  if (numAdded + numRemoved + numModified > 0) {
    var username = this._username;
    var repo = this._repo;
    var showFilesLink = _ce('a',
      {'href': '#',
       'class': 'libgithub-badge-showMoreLink',
       'id': 'showMoreLink' + username + repo});

    $(showFilesLink).append(_tn('Show files'));
    $(diffStat).append(_tn(' '));
    $(diffStat).append(showFilesLink);

    $(showFilesLink).click(function () {
      $(fileList).slideToggle();

      if ($(this).text() == 'Show files')
        $(this).text('Hide files');
      else
        $(this).text('Show files');
      return false;
    });
  }

  return diffStat;
};


libgithub.Badge.prototype._fileList = function (commit)
{
  var filesAdded = ('added' in commit) ? commit.added : [];
  var filesRemoved = ('removed' in commit) ? commit.removed : [];
  var filesModified = ('modified' in commit) ? commit.modified : [];

  var fileList = _ce('div',
    {'class': 'libgithub-badge-filelist',
     'id': this._username + this._repo});
  var words = {'added': ['Added', filesAdded],
               'removed': ['Removed', filesRemoved],
               'modified': ['Modified', filesModified]};

  for (word in words) {
    var container = _ce('div');
    var ulist = _ce('ul');
    var cName = 'libgithub-badge-diff' + word;
    var text = words[word][0] + ':';
    var fset = words[word][1];
    var i = 0;

    $(container).append($(_ce('span', {'class': cName})).text(text));
    $(container).append(ulist);

    $.each(fset, function(j, f) {
      var file = _ce('li');
      if (word == 'modified')
        $(file).append(_tn(f.filename));
      else
        $(file).append(_tn(f));
      $(ulist).append(file);
      i++;
    });

    if (i > 0)
      $(fileList).append(container);
  }

  return fileList;
};


libgithub.Badge.prototype._badgeStructure = function (commit)
{
  var username = this._username;
  var repo = this._repo;
  var badgeDiv = _ce('div', {'class': 'libgithub-badge-outline'});
  var userRepo = this._userRepo(commit);
  var diffLine = this._diffLine(commit);
  var commitMessage = this._commitMessage(commit);
  var fileList = this._fileList(commit);
  var diffStat = this._diffStat(commit, fileList);

  $(badgeDiv).append(userRepo);
  $(badgeDiv).append(diffLine);
  $(badgeDiv).append(commitMessage);
  $(badgeDiv).append(diffStat);
  $(badgeDiv).append(fileList);

  badgeDiv.hideFiles = function () {
    $(fileList).hide();
  };

  return badgeDiv;
};


libgithub.Badge.prototype._callback = function (data, element)
{
  if ('commit' in data) {
    var badgeDiv = this._badgeStructure(data.commit);
    element.append(badgeDiv);
    if (this._startHidden)
      badgeDiv.hideFiles();
  }
};


libgithub.Badge.prototype._showCommit = function (commitId, element)
{
  var _url = 'https://github.com/api/v2/json/commits/show/' +
              this._username + '/' + this._repo + '/' + commitId +
             '?callback=?';
  var _this = this;

  $.getJSON(_url, function (data) { _this._callback(data, element); });
};


libgithub.Badge.prototype._showCommits = function (branch, element)
{
  var _url = 'https://github.com/api/v2/json/commits/list/' +
             this._username + '/' + this._repo + '/' + branch +
             '?callback=?';
  var _this = this;

  $.getJSON(_url, function (data) {
    var maxLength = Math.min(_this._numCommits, data.commits.length);
    for (var i = 0; i < maxLength; ++i)
      _this._showCommit(data.commits[i].id, element);
  });
};


libgithub.Badge.prototype.targetIs = function (selector)
{
  this._target = selector;
  var _element = $(selector);

  if (this._numCommits > 1)
    this._showCommits(this._commitId, _element);
  else
    this._showCommit(this._commitId, _element);
};


/**
 * libgithub.ActivityLine: a single-line activity indicator for a repository.
 */
libgithub.ActivityLine = function (username, repo, commitId)
{
  this._username = username;
  this._repo = repo;
  this._commitId = (typeof(commitId) == 'undefined') ? 'master' : commitId;
  this._gravatarSize = 32;
  this._target = null;
  this._repoLink = null;

  this.gravatarSize = function () { return this._gravatarSize; };
  this.gravatarSizeIs = function (size) { this._gravatarSize = size; };
  this.repoLink = function () { return this._repoLink; };
  this.repoLinkIs = function (link) { this._repoLink = link; };
  this.target = function () { return this._target; };
};


libgithub.ActivityLine.prototype.targetIs = function (selector)
{
  this._target = selector;
  var _element = $(selector);

  this._showCommit(this._commitId, _element);
};


libgithub.ActivityLine.prototype._showCommit = function (commitId, element)
{
  var _url = 'https://github.com/api/v2/json/commits/show/' +
              this._username + '/' + this._repo + '/' + commitId +
             '?callback=?';
  var _this = this;

  $.getJSON(_url, function (data) { _this._callback(data, element); });
};


libgithub.ActivityLine.prototype._callback = function (data, element)
{
  if ('commit' in data) {
    var lineDiv = this._activityLineStructure(data.commit);
    element.append(lineDiv);
  }
};


libgithub.ActivityLine.prototype._activityLineStructure = function (commit)
{
  var username = this._username;
  var repo = this._repo;
  var lineDiv = _ce('div', {'class': 'libgithub-activity-line'});

  if (this._gravatarSize > 0) {
    var image = _ce(
      'img',
      {'src': _gravatarImageURL(commit.committer.email, this._gravatarSize),
       'class': 'libgithub-activity-gravatar',
       'alt': this._username});
    $(lineDiv).append(image);
  }

  if (this._repoLink) {
    var repoUrl = 'github.com/' + username + '/' + repo;
    var repoLink = _ce('a', {
      'href': 'https://' + repoUrl,
      'target': '_blank',
      'class': 'libgithub-activity-repository'
    });

    $(repoLink).append(_tn(repoUrl));

    // If _repoLink is a function, allow the client to transform repoLink.
    if (typeof this._repoLink == 'function') {
      repoLink = $(this._repoLink(repoLink));
    } else {  // Else, add a colon and space.
      var span = $(_ce('span', {'class': 'libgithub-activity-repolink'}));
      repoLink = span.append(repoLink).append(': ');
    }

    $(lineDiv).append(repoLink);
  }

  var login = commit.committer.login;
  var loginLink = _ce('a', {'href': 'https://github.com/' + login,
                            'target': '_blank',
                            'class': 'libgithub-activity-username'});
  $(loginLink).append(_tn(login));

  var link = _ce('a',
    {'href': 'https://github.com' + commit.url,
     'target': '_blank',
     'class': 'libgithub-activity-commitid'});
  $(link).append(_tn(' ' + _truncate(commit.id, 10, '')));

  var niceTime = _niceTime(commit.committed_date);
  var commitDate = _ce('span',
    {'class': 'libgithub-activity-date'});
  $(commitDate).append(_tn(niceTime));

  $(lineDiv).append(loginLink);
  $(lineDiv).append(_tn(' committed '));
  $(lineDiv).append(link);
  $(lineDiv).append(_tn(' about '));
  $(lineDiv).append(commitDate);

  return lineDiv;
};


/** utility functions **/

/**
 * truncate a string to a given length
 *
 * Args:
 *   string: string to truncate
 *   length: truncation length
 *   truncation: optional string to append to truncation (default: '...')
 *
 * Returns:
 *   truncated string
 */
var _truncate = function (string, length, truncation)
{
  length = length || 30;
  truncation = (typeof truncation == 'undefined') ? '...' : truncation;
  return string.length > length ?
    string.slice(0, length - truncation.length) + truncation : string;
};


/**
 * format a commit time into a 'humane' string
 *
 * Args:
 *   dateTime: date string returned with a commit
 *
 * Returns:
 *   humane string like '8 weeks ago'
 */
var _niceTime = function (dateTime)
{
  var d = Date.parse(dateTime);
  d.addHours((new Date).getTimezoneOffset() / 60);
  return humane_date(d.toString("yyyy-MM-ddTHH:mm:ssZ"));
};


/**
 * create an HTML element
 *
 * Args:
 *   tagName: name of tag
 *   attributes: map of attribute -> value pairs
 *
 * Returns:
 *   new element
 */
var _ce = function (tagName, attributes)
{
  var e = document.createElement(tagName);
  for (attr in attributes) {
    var value = attributes[attr];
    e.setAttribute(attr, value);
  }
  return e;
};


/**
 * create text node ready for insertion into HTML element
 *
 * Args:
 *   text: text node content
 *
 * Returns:
 *   new text node
 */
var _tn = function (text)
{
  return document.createTextNode(text);
};


/**
 * Generate a Gravatar image URL.
 *
 * Args:
 *   email: email address
 *   size: size in pixels
 *
 * Returns:
 *   image URL
 */
var _gravatarImageURL = function (email, size)
{
  return 'http://www.gravatar.com/avatar/' + hex_md5(email) + '?s=' + size;
};