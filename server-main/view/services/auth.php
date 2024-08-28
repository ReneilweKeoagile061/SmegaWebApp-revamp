<?php


    // if (isset($_POST['username']) && isset($_POST['password'])) {
    //     $ad  = ldap_connect("ldap://BWGAHQADDC04.corp.btc.bw") or die("Couldn't connect to AD!");
    //     ldap_set_option($ad, LDAP_OPT_PROTOCOL_VERSION, 3);
    //     ldap_set_option($ad, LDAP_OPT_REFERRALS, 0);

    //     if($ad) {
    //         $username = $_POST['username'];
    //         $password = $_POST['password'];
    //         $bd = @ldap_bind($ad,$username,$password);

    //         if($bd) {
    //            // $dn = "ou=,dc=btc,dc=bw"; 
    //             $filter = "(cn=$username)";
    //             $result = ldap_search($ad,$dn,$filter);
    //             $entries = ldap_get_entries($ad,$result);

    //             if($entries["count"] > 0 ) {
    //                 $usesr_dn = $entries[0]["dn"];
    //                 if(@ldap_bind($ad,$usesr_dn,$password)) {

    //                 }
    //             }
    //         }

    //         ldap_unbind($ad);
            
    //     }
    // }

    // header("Location: ../view/index.html" );

    header("Access-Control-Allow-Origin: *");

// Allow specific methods
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

// Allow specific headers
header("Access-Control-Allow-Headers: Content-Type");

    echo "<script>console.log('PHP file is running');</script>";
    
?>
