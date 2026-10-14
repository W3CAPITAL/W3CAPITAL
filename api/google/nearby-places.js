import {runOfficialGooglePlaces} from './_adapter.js';
export default function handler(req,res){return runOfficialGooglePlaces('nearby-places',req,res);}
