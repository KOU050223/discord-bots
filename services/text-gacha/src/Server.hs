{-# LANGUAGE OverloadedStrings #-}

module Server (app) where

import Data.Aeson (KeyValue ((.=)), ToJSON, encode, object)
import Network.HTTP.Types (Header, Status, hContentType, status200, status404, status405)
import Network.Wai (Application, Response, pathInfo, requestMethod, responseLBS)
import Gacha (shuffleChars)

app :: Application
app req respond =
    case (requestMethod req, pathInfo req) of
        ("GET",  ["health"]) -> respond (jsonOk (object ["status" .= ("ok" :: String)]))
        ("POST", ["gacha"])  -> do
            result <- shuffleChars
            respond (jsonOk (object ["result" .= result]))
        (_,      ["gacha"])  -> respond (jsonErr status405 "Method Not Allowed")
        _                    -> respond (jsonErr status404 "Not Found")

jsonOk :: ToJSON a => a -> Response
jsonOk val = responseLBS status200 [contentType] (encode val)

jsonErr :: Status -> String -> Response
jsonErr status msg = responseLBS status [contentType] (encode (object ["error" .= msg]))

contentType :: Header
contentType = (hContentType, "application/json")
