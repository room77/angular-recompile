<?php
/* @author holman
 *
 * Simple file that sets up a Twig environment
 */

namespace twig;

require_once 'bower_components/Twig/lib/Twig/Autoloader.php';

function Render($template_name, $params = array()) {
  \Twig_Autoloader::register();
  $loader = new \Twig_Loader_Filesystem('templates');
  $twig = new \Twig_Environment($loader, array());

  $template = $twig->loadTemplate($template_name);
  echo $template->render($params);
}

?>
