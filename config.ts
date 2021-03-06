import { exists } from "fs/exists.ts";
import { CONFIG_FILE_NAME } from "/constants.ts";
import { value, warn } from "/util/fmt.ts";

interface HttpsConfig {
  secure: boolean;
  certFile?: string;
  keyFile?: string;
}

interface Config {
  port: number;
  https: HttpsConfig;
  imageRepository: string;
  recacheInterval: string;
  githubToken: string;
  cacheFile: string;
}

async function getConfigOrNull(): Promise<Config | null> {
  if (await exists(CONFIG_FILE_NAME)) {
    const text = await Deno.readTextFile(CONFIG_FILE_NAME);
    return JSON.parse(text);
  } else {
    return null;
  }
}

function promptTillValid(msg: string, validInputs: string[]): string {
  while (true) {
    const input = prompt(msg + " [" + validInputs.join("/") + "]: ");
    if (validInputs.includes(input!)) {
      return input!;
    }
  }
}

async function initializeDefaultConfig(): Promise<void> {
  const config: Config = {
    port: 8080,
    https: {
      secure: false,
    },
    imageRepository: "https://github.com/dog-jamalam-tech/images",
    recacheInterval: "1 */30 * * * *",
    githubToken: "",
    cacheFile: "cache.json",
  };

  await Deno.writeTextFile(CONFIG_FILE_NAME, JSON.stringify(config, null, 2));
}

export async function getConfig(): Promise<Config> {
  const config = await getConfigOrNull();
  if (config === null) {
    if (
      promptTillValid(
        "Config not found. Would you like to create a default one?",
        ["y", "n"],
      ) == "y"
    ) {
      await initializeDefaultConfig();
      console.log(
        warn(
          "Default config created, please check configuration at " +
            value(CONFIG_FILE_NAME),
        ),
      );

      Deno.exit(0);
    } else {
      promptTillValid("Please create a config. ", ["done"]);
    }
    return await getConfig();
  } else {
    return config;
  }
}
