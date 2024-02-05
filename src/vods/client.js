import { feathers } from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";

const vodsClient = feathers();

// Connect to a different URL
const restClient = rest(process.env.REACT_APP_VODS_API_BASE);

// Configure an AJAX library (see below) with that client
vodsClient.configure(restClient.fetch(window.fetch.bind(window)));

export default vodsClient;
