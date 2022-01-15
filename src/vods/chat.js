import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Menu, MenuItem, Pagination, Grid, Tooltip, Link } from "@mui/material";
import SimpleBar from "simplebar-react";
import Loading from "../utils/Loading";
import Moment from "moment";
import { useLocation, useParams } from "react-router-dom";

const GLOBAL_TWITCH_BADGES_API = "https://badges.twitch.tv/v1/badges/global/display?language=en";
const BASE_TWITCH_CDN = "https://static-cdn.jtvnw.net";
const BASE_FFZ_EMOTE_CDN = "https://api.frankerfacez.com/v1";
const BASE_BTTV_EMOTE_CDN = "https://cdn.betterttv.net";
const BASE_7TV_EMOTE_CDN = "https://api.7tv.app/v2";

export default function Chat(props) {
  return <></>;
}
