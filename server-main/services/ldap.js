import axios from 'axios';
import qs from 'qs';
import jwt from 'jsonwebtoken';

export const auth = async (email, password) => {
     if (email && password) {
         const data = qs.stringify({
            'client_id': process.env.CLIENT_ID || 'btc-ad_client',
            'username': email,
            'password': password,
            'grant_type': 'password',
            'client_secret': process.env.CLIENT_SECRET || 'kgJAQuPkZ94JteTEbK8lh3cS2lIuUqOY',
            'scope': 'openid'
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.AUTH_URL || 'https://keycloak-sso-system.services.btc.bw/auth/realms/btc_staff/protocol/openid-connect/token',
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded', 
                'Cookie': process.env.COOKIE || '3ef88a617efab92ffb28f2972e7d264d=90685909102409f035b1fa89a0185afd'
            },
            data: data
        };

        function validateToken(token) {
            const result = {};

            try {
                const decoded = jwt.decode(token);
                if (!decoded) throw new Error("Invalid token");

                const azpCheck = decoded.azp === 'btc-ad_client';
                if (!azpCheck) throw new Error("Access denied: azp does not match");

                const currentTime = Math.floor(Date.now() / 1000);
                const expCheck = decoded.exp > currentTime;
                if (!expCheck) throw new Error("Access denied: Token has expired");

                const hasRoles = decoded.realm_access && decoded.realm_access.roles && decoded.realm_access.roles.length > 0;
                if (!hasRoles) {
                    result['state'] = false;
                    result['message'] = "The User does not have an assigned role."
                    return result;
                };

                console.log("Access granted: All criteria met");
                result['state'] = true;
                result['name'] = decoded.name;
                return result;
            } catch (error) {
                console.error("Token validation error:", error.message);
            }
        }

        try {
            const response = await axios.request(config);
            const token = response.data.access_token;
            //console.log("Received token:", token)
            //console.log(data);
           const result =validateToken(token);

          return result
            
        } catch (error) {
            console.error("Error during authentication", error.message);
            const result2={}
            result2['state'] = false;
            result2['message'] = "Error during authentication";
            return result2;
        }
    }

    
}
