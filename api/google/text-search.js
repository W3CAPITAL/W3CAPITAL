import {runOfficialGooglePlaces} from './_adapter.js';
export default function handler(req,res){return runOfficialGooglePlaces('text-search',req,res);}
