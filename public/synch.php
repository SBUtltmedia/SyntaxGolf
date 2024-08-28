<?php 
#exec('sh /home/pstdenis/bin/synchGit', $output, $retval);
exec(' cd /home/pstdenis/www/htdocs/SyntaxGolf && git pull', $output, $retval);
print_r($output);
print_r($retval);
