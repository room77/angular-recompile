define(['angular', './module'], function(angular, controllers) {
  'use strict';

  controllers.controller('OfficeStreetViewCtrl', [
    '$scope', '$timeout', 'from_server', _OfficeStreetViewCtrl
  ]);

  return;

  /*** Controller defined below ***/

  function _OfficeStreetViewCtrl($scope, $timeout, from_server) {
    // Constants
    var IMG_PATH = 'https://s3.amazonaws.com/photos.room77/team/',
        COUNTRY_MAP_URL = [
          'https://chart.googleapis.com/chart?cht=map:fixed=-60,-170,85,180&',
          'chs=340x250&chco=333333|006400&chld='].join(''),
        PORTRAIT_URL = [
          'https://s3.amazonaws.com/photos.room77/team/',
          'portraits/portrait_'].join('');

    var KEY_CODE_MAP = {
      37: 'W', 38: 'N', 39: 'E', 40: 'S',         // arrow keys

      72: 'W', 74: 'S', 75: 'N', 76: 'E',         // vim nav

      98: 'S', 100: 'W', 102: 'E', 104: 'N',      // numpad
      97: 'SW', 99: 'SE', 103: 'NW', 105: 'NE',

      65: 'W', 68: 'E', 83: 'S', 87: 'N'          // gamer keypad
    };
    var DIR_NAME_ARR = [ 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW' ];
    var DIR_INDEX_MAP = {}; // this will map dir to index ('N' => -1)

    var DIR_DIFF = [
      [ 0, 1 ],   // this is N
      [ 1, 1 ],   // NE
      [ 1, 0 ],   // E
      [ 1, -1 ],
      [ 0, -1 ],  // S
      [ -1, -1 ],
      [ -1, 0 ],  // W
      [ -1, 1 ]
    ];

    // Only one of these filters can be active at once
    var TEAM_ROLES_MAP = {
      product: true,
      business: true,
      eng: true,
      mktg: true
    };

    // Set by from_server
    var BIO_MAP = null,
        FILTER_MAP = null,
        LOC_TYPES = null,
        MIN_PT = null,
        MAX_PT = null;

    // No picture
    var BLOCKED = {
      Dd: true
    };

    var _cur = { pt: null, dir: null },
        _cached = { people: [], meet_map: {}, filter_map: {}, query: '' },
        _people = [];

    _ResetScope();

    $scope.Init = function() {
      // Index is used a lot in this function
      var i;

      _InitFromServer();

      // let's create the DIR_INDEX_MAP
      for (i = 0; i < 8; i++) DIR_INDEX_MAP[DIR_NAME_ARR[i]] = i;

      // Add portraits and initialize $scope.people
      for (var key in BIO_MAP) {
        if (BLOCKED.hasOwnProperty(key)) {
          delete BIO_MAP[key];
          continue;
        }

        var bio = BIO_MAP[key];

        bio.key = key;
        bio.img = PORTRAIT_URL + bio.key + '.png';

        bio.countries.push('US'); // Everyone has been to us
        bio.countries_url = COUNTRY_MAP_URL + 'US';
        for (i = 0; i < bio.countries.length; i++) {
          bio.countries_url += '|' + bio.countries[i];
        }

        bio.filter_map = {};
        for (i = 0; i < bio.filters.length; i++) {
          bio.filter_map[bio.filters[i]] = true;
        }

        if (bio.pts.length > 0) {
          var pt = bio.pts[0];    // Only need one point for direct lookup
          for (i = 0; i < 8; i++) {
            var tmp_pt = _Move(pt, DIR_DIFF[i]);
            if (_GetLocType(tmp_pt) === 'loc') {
              // this info is in case we want to directly go to this person
              bio.pt = pt;
              bio.dir = DIR_NAME_ARR[(i + 4) % 8];
              bio.prev_dir = (i % 2 === 0 ? DIR_NAME_ARR[(i + 4) % 8]
                : DIR_NAME_ARR[(i + 4 + (i % 4) - 2) % 8]);

              break;
            }
          }
        }

        _people.push(bio);
      }
      _people = _ShuffleArray(_people);
      _cached.people = _people;

      // Initializing filters
      $scope.filters = [];
      for (var filter_key in FILTER_MAP) {
        $scope.filters.push({
          key: filter_key, name: FILTER_MAP[filter_key], applied: false
        });
      }

      _cur.pt = [6, 9];
      _cur.dir = 'W';

      // bind keystrokes
      /* TODO @holman put back in
      $('body').on('keydown', function(e) {
        if ($scope.splash_open) return;
        if (e.ctrlKey) return;

        if (e.keyCode in KEY_CODE_MAP) {
          e.preventDefault();

          var new_dir = KEY_CODE_MAP[e.keyCode],
              new_index = (DIR_INDEX_MAP[_cur.dir] + DIR_INDEX_MAP[new_dir]) % 8;

          $scope.$apply(function() {
            if (new_dir === 'N') {
              // Try until you cant
              var new_pt = _Move(_cur.pt, DIR_DIFF[new_index]);
              var type = null;
              while (_IsValidPt(new_pt)) {
                type = _GetLocType(new_pt);

                if (type === 'loc') {
                  _cur.pt = new_pt;
                  _UpdateDisplay();
                  break;
                }
                new_pt = _Move(new_pt, DIR_DIFF[new_index]);
              }
            }
            else {
              _cur.dir = DIR_NAME_ARR[new_index];
              _UpdateDisplay();
            }
          });
        }
      });
      */

      // We don't display surroundings until after the splash screen
      //  has been closed
      _DisplayMainImg();
    };

    $scope.Meet = function(person) {
      if (person.pts.length <= 0) {
        alert('Not in view yet!');
        return;
      }

      if ($scope.splash_open) $scope.CloseSplash();
      if ($scope.bio && $scope.bio.key == person.key) return;

      $scope.filters_open = false;

      _cur.pt = person.pt;
      _cur.dir = person.dir;

      $scope.bio = person;

      _UpdateDisplay();
      $scope.meet = [person];
    };

    $scope.Back = function() {
      if (!$scope.bio) return;

      var dir_idx = (DIR_INDEX_MAP[_cur.dir] + 4) % 8;
      _cur.pt = _Move(_cur.pt, DIR_DIFF[dir_idx]);
      _cur.dir = $scope.bio.prev_dir;

      _UpdateDisplay();

      $scope.bio = null;
    };

    $scope.FilterPeopleAndPrioritizeMeet = function() {
      // Indexing used a lot
      var i;

      // Check cache
      var meet_map = {},
          redo = false;

      for (var dir in $scope.meet) {
        meet_map[$scope.meet[dir].key] = true;
      }
      if (!angular.equals(meet_map, _cached.meet_map)) {
        redo = true;
        _cached.meet_map = meet_map;
      }

      var filter_map = {};
      for (i = 0; i < $scope.applied_filters.length; i++) {
        filter_map[$scope.applied_filters[i].key] = true;
      }
      if (!angular.equals(filter_map, _cached.filter_map)) {
        redo = true;
        _cached.filter_map = filter_map;
      }

      if ($scope.qu.ery !== _cached.query) {
        redo = true;
        _cached.query = $scope.qu.ery;
      }

      if (!redo) return _cached.people;

      var meet_people = [],
          non_meet_people = [];

      for (i = 0; i < _people.length; i++) {
        var person = _people[i];

        if (!$scope.FitsFilter(person)) continue;

        if (meet_map.hasOwnProperty(person.key)) {
          meet_people.push(person);
          person.in_view = true;
        }
        else {
          non_meet_people.push(person);
          person.in_view = false;
        }
      }

      _cached.people = meet_people.concat(non_meet_people);
      return _cached.people;
    };

    $scope.ToggleFiltersOpen = function() {
      $scope.filters_open = !$scope.filters_open;
    };

    $scope.CloseFilters = function() {
      $scope.filters_open = false;
    };

    $scope.ToggleFilter = function(filter) {
      var check_roles = false;

      // Only one team role can be active at once
      if (TEAM_ROLES_MAP.hasOwnProperty(filter.key)) check_roles = true;

      for (var i = 0; i < $scope.applied_filters.length; i++) {
        var this_filter = $scope.applied_filters[i];

        // We are clicking again, so unapply filter
        if (this_filter.key === filter.key) {
          filter.applied = false;
          $scope.applied_filters.splice(i, 1);
          return;
        }

        if (check_roles &&
            TEAM_ROLES_MAP.hasOwnProperty(this_filter.key)) {
          $scope.applied_filters[i].applied = false;
          $scope.applied_filters.splice(i, 1);
          i--;
        }
      }

      filter.applied = true;
      $scope.applied_filters.push(filter);
    };

    $scope.HaltFilter = function(idx) {
      $scope.applied_filters[idx].applied = false;
      $scope.applied_filters.splice(idx, 1);
    };

    $scope.FitsFilter = function(person) {
      for (var i = 0; i < $scope.applied_filters.length; i++) {
        var filter = $scope.applied_filters[i];

        if (!person.filter_map.hasOwnProperty(filter.key)) {
          return false;
        }
      }

      if ($scope.qu.ery && $scope.qu.ery !== '') {
        var query = $scope.qu.ery.toLowerCase();

        if (person.name.toLowerCase().indexOf(query) < 0 &&
            // Hack for Nick
            !(person.short_name === 'Nick' && $scope.qu.ery === 'Nick')) {
          return false;
        }
      }

      return true;
    };

    $scope.CloseSplash = function() {
      $scope.splash_open = false;
      _UpdateDisplay();
    };

    $scope.PortraitsFwd = function() {
      $scope.portraits_margin -= $scope.portrait_width;
    };

    $scope.PortraitsBack = function() {
      $scope.portraits_margin += $scope.portrait_width;
    };

    $scope.ShowPortraitsBack = function() {
      if ($scope.portraits_margin >= 0) return false;
      else return true;
    };

    return;

    function _ResetScope() {
      $scope.splash_open = true;

      $scope.main_img = '';
      $scope.backup_img = null;
      $scope.meet = {};
      $scope.bio = null;
      $scope.qu = { ery: '' }; // Why angular do you torture me?
      $scope.portraits_margin = 0;
      $scope.portrait_width = 101;

      $scope.filters = null;
      $scope.applied_filters = [];
    }

    function _IsValidPt(pt) {
      if (pt[0] < MIN_PT[0] || pt[0] > MAX_PT[0] ||
          pt[1] < MIN_PT[1] || pt[1] > MAX_PT[1]) return false;
      else return true;
    }

    function _GetLocType(pt) {
      if (!_IsValidPt(pt)) return '';
      else return LOC_TYPES[pt[0]][pt[1]];
    }

    function _UpdateDisplay() {
      _DisplayMainImg();
      _DisplaySurroundings();
    }

    function _DisplayMainImg() {
      // display img
      var type = _GetLocType(_cur.pt);

      var img_src = IMG_PATH;
      if (type === 'loc' || type === 'start') {
        img_src += 'loc_' + _cur.pt[0] + '_' + _cur.pt[1] + '_' + _cur.dir + '.jpg';
      }

      // This is when the pt is a person
      else img_src += type + '.jpg';

      $scope.main_img = img_src;
      if (!$scope.backup_img) $scope.backup_img = img_src;
    }

    function _Move(pt, offset) {
      return [pt[0] + offset[0], pt[1] + offset[1]];
    }

    function _DisplaySurroundings() {
      // Reset some things
      $scope.meet = {};
      $scope.portraits_margin = 0;

      var cur_idx = DIR_INDEX_MAP[_cur.dir],
          cur_type = _GetLocType(_cur.pt);

      if (cur_type !== 'loc' && cur_type !== 'start') return;

      for (var i = 0; i < 8; i += 1) {
        var tmp = {
          dir: DIR_NAME_ARR[i],
          idx: (cur_idx + i) % 8,
          type: ''
        };
        tmp.pt = _Move(_cur.pt, DIR_DIFF[tmp.idx]);

        if (_IsValidPt(tmp.pt)) tmp.type= _GetLocType(tmp.pt);

        // object to visit
        if (cur_type !== 'start' && tmp.type && tmp.type !== 'loc' &&
            tmp.type !== 'start' && tmp.dir !== 'S') {
          var bio = BIO_MAP[tmp.type];

          $scope.meet[tmp.dir] = bio;
        }
/*
        // differentiate between hor/vert movement vs diagonal
        // we are not allowing diagonal movement
        if (i % 2 == 0) {
          var $move_img = $('#' + my_dir + '_move');

          // object to visit
          if (my_key !== 'start' && key && key !== 'loc' && key !== 'start'
              && my_dir !== 'S') {
            _UpdateMeetImg($meet_div, $meet_text,
                           key, tmp_pt, DIR_NAME_ARR[new_index],
                           DIR_NAME_ARR[new_index]);
            //_Hide($move_img);
          }
          else _Hide($meet_div);

          // also check for location we can move to
          if (my_dir === 'N') {
            var button_set = false;
            while (_IsValidPt(tmp_pt)) {
              if (key === 'loc') {
                // we move to the next point if N
                _UpdateMoveImg($move_img, tmp_pt, DIR_NAME_ARR[new_index]);
                button_set = true;
                break;
              }

              tmp_pt = _Move(tmp_pt, DIR_DIFF[new_index]);
              key = _GetLocType(tmp_pt);
            }
            if (!button_set) _Hide($move_img);
          }
          else if (my_key === 'start') _Hide($move_img);
          else if (my_key === 'loc') {
            // we just turn if S, W, or E
            _UpdateMoveImg($move_img, _pt, DIR_NAME_ARR[new_index]);
          }
        }
        // if diagonal, only check if object to visit
        else if (key && key !== 'loc') {
          _UpdateMeetImg($meet_div, $meet_text,
                         key, tmp_pt, DIR_NAME_ARR[new_index],
                         DIR_NAME_ARR[(new_index + (i % 4) - 2) % 8]);
        }
        else _Hide($meet_div);
      */
      }
    }

    // From stack overflow: http://stackoverflow.com/questions/2450954/how-to-randomize-a-javascript-array
    function _ShuffleArray(array) {
      var currentIndex = array.length,
          temporaryValue,
          randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }

    function _InitFromServer() {
      var vars = from_server.Get('vars');

      BIO_MAP = vars.bio_map;
      FILTER_MAP = vars.filter_map;
      LOC_TYPES = vars.loc_types;
      MAX_PT = vars.max_pt;
      MIN_PT = vars.min_pt;
    }
  }
});
