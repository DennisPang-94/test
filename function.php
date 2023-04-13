<?php

function getInteractiveMapDetails(&$variables)
{
  $id = $_ENV['DNB_CONFIGURATIONS_ID'] ? $_ENV['DNB_CONFIGURATIONS_ID'] : 302;
  $lang_code = $variables['language_code'] ? $variables['language_code'] : 'en';
  $node =  \Drupal\node\Entity\Node::load($id);
  //dd($node);
  $configurations = $node->hasTranslation($lang_code) ? $node->getTranslation($lang_code) : $node;
  $speed5g = $configurations->get('field_5g_speed')->getValue() ? $configurations->get('field_5g_speed')->getValue()[0]['value'] : '';
  $speed4g = $configurations->get('field_4g_speed')->getValue() ? $configurations->get('field_4g_speed')->getValue()[0]['value'] : '';
  $sitesInProgress = $configurations->get('field_sites_in_progress')->entity ? file_url_transform_relative(file_create_url($configurations->get('field_sites_in_progress')->entity->getFileUri())) : null;
  $fileArray = [];
  foreach($configurations->get('field_json_files') as $file){
    array_push($fileArray,file_url_transform_relative(file_create_url($file->entity->getFileUri())));
  }
  //dd($fileArray);
  $variables['#attached']['drupalSettings']['sites_on_air_files'] = $fileArray;
  $variables['#attached']['drupalSettings']['sites_in_progress'] = $sitesInProgress;
  $variables['#attached']['drupalSettings']['sites_in_progress_mode'] = $_ENV['SITES_IN_PROGRESS_MODE'] ? $_ENV['SITES_IN_PROGRESS_MODE'] : 'markers';
  $variables['spped_5g'] = $speed5g;
  $variables['spped_4g'] = $speed4g;
  $variables['sites_in_progress'] = $sitesInProgress;
}
//test
