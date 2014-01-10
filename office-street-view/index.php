<?php
/* @author holman
 *
 */

require_once 'php/twig.php';

$START_PT = array(0, 0);
$START_DIR = 'N';

// map x to list of y's where (x, y) is a valid place to look around
$VALID_LOCS = array(
  '0' => array(1, 4, 6, 9),
  '3' => array(1, 4, 6, 9),
  '6' => array(1, 4, 6, 9),
);

// will be filled in
$bio_map = array();
$lang_map = array();
$filter_map = array();
$min_pt = null;
$max_pt = null;
$pts = array();

// lets read in the bios, and make a map
$fin = fopen('data/bios_new.csv', 'r');
$cat_actions = array(
  'People' => function(&$info) use (&$bio_map, &$min_pt, &$max_pt) {
    $my_pts = array();

    // picture not taken yet if not in this loop
    if ($info[3] !== '' && $info[4] !== '') {
      $x_list = explode(',', $info[3]);
      $y_list = explode(',', $info[4]);

      foreach ($x_list as $idx => $x) {
        $x = intval($x);
        $y = intval($y_list[$idx]);

        if (empty($min_pt)) $min_pt = $max_pt = array($x, $y);
        else {
          if ($min_pt[0] > $x) $min_pt[0] = $x;
          else if ($max_pt[0] < $x) $max_pt[0] = $x;

          if ($min_pt[1] > $y) $min_pt[1] = $y;
          else if ($max_pt[1] < $y) $max_pt[1] = $y;
        }

        array_push($my_pts, array($x, $y));
      }
    }

    $trim = function($str) { return trim($str); };

    $bio_map[$info[0]] = array(
      'name' => $info[1],
      'short_name' => $info[2],
      'pts' => $my_pts,
      'role' => $info[5],
      'languages' => empty($info[6]) ? array()
                       : array_map($trim, explode(',', $info[6])),
      'countries' => empty($info[7]) ? array()
                       : array_map($trim, explode(',', $info[7])),
      'eng' => array(
        'lang' => $info[8],
        'editor' => $info[9],
      ),
      'filters' => empty($info[10]) ? array()
          : array_map($trim, explode(',', $info[10])),
      'quote' => $info[11],
      'detailed_info' => $info[12]
    );
  },
  'Places' => function(&$info) {},
  'Languages' => function(&$info) use (&$lang_map) {
    $lang_map[$info[0]] = $info[1];
  },
  'Filters' => function(&$info) use (&$filter_map) {
    $filter_map[$info[0]] = $info[1];
  }
);
$curr_cat = '';

if (!feof($fin)) {
  while (!feof($fin)) {
    $line = trim(fgets($fin));
    if (empty($line)) break;

    $info = explode('|', $line);
    if (empty($info[0])) continue;

    if (array_key_exists($info[0], $cat_actions)) {
      $line = fgets($fin); // get rid of header line
      $curr_cat = $info[0];
      continue;
    }

    if (!empty($curr_cat)) $cat_actions[$curr_cat]($info);
  }
}
ksort($bio_map);

// Make loc types array
for ($i = $min_pt[0]; $i <= $max_pt[0]; $i++) {
  if (array_key_exists($i, $VALID_LOCS)) {
    $loc_types[$i] = array_combine($VALID_LOCS[$i], array_fill(0, sizeof($VALID_LOCS[$i]), 'loc'));
  }
  else $loc_types[$i] = array();
}

// fill loc arrays with people
foreach ($bio_map as $key => &$bio) {
  foreach ($bio['pts'] as $pt) {
    $loc_types[$pt[0]][$pt[1]] = $key;
  }
}
$loc_types[$START_PT[0]][$START_PT[1]] = 'start';

// Render the page from template
twig\Render('app.html',
  array(
    'bio_map' => $bio_map,
    'dir_name' => array(
      array('NW', 'N', 'NE'),
      array('W', 'mid', 'E'),
      array('SW', 'S', 'SE')
    ),
    'JS_VARS_FROM_SERVER_JSON' => json_encode(array(
      'vars' => array(
        'bio_map' => $bio_map,
        'filter_map' => $filter_map,
        'min_pt' => $min_pt,
        'max_pt' => $max_pt,
        'loc_types' => $loc_types,
        'START_PT' => $START_PT,
        'START_DIR' => $START_DIR
      ),
      'lang_map' => $lang_map,
    )),
  )
);

exit;

?>
