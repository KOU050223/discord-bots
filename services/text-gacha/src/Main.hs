module Main where

import Network.Wai.Handler.Warp (run)
import Network.Wai.Middleware.RequestLogger (logStdout)
import System.Environment (lookupEnv)
import Text.Read (readMaybe)
import Server (app)

main :: IO ()
main = do
    portStr <- lookupEnv "PORT"
    let port = maybe 8080 id (portStr >>= readMaybe)
    putStrLn $ "text-gacha listening on :" <> show port
    run port (logStdout app)
