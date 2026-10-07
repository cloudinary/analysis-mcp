# Running the MCP Server with Docker

This document provides instructions on how to build and run the Model Context Protocol (MCP) server using Docker.

## Building the Image

You can build the Docker image in two ways: from a local clone of the repository or directly from GitHub.

### Building from a Local Clone

First, build the Docker image from the root of the project:

```sh
docker build -t cloudinary-analysis-mcp .
```

### Building from GitHub

You can also build the image directly from the GitHub repository without cloning it first.

```sh
docker build -t cloudinary-analysis-mcp https://github.com/cloudinary/analysis-mcp.git
```

## Running the Container

The MCP server requires Cloudinary credentials to run. You can provide these credentials in one of three ways. When running the `docker run` command, you will also map a local port (e.g., `2718`) to the container's port `2718`.

**Note:** Replace `<your_cloud_name>`, `<your_api_key>`, and `<your_api_secret>` with your actual Cloudinary credentials.

### Option 1: Using Individual Environment Variables

This is the recommended method.

```sh
docker run -d -p 127.0.0.1:2718:2718 \
  -e CLOUDINARY_CLOUD_NAME="<your_cloud_name>" \
  -e CLOUDINARY_API_KEY="<your_api_key>" \
  -e CLOUDINARY_API_SECRET="<your_api_secret>" \
  cloudinary-analysis-mcp start --transport sse --host 0.0.0.0
```

**Note:** The `--host 0.0.0.0` flag is required inside Docker containers for port mapping to work. The `-p 127.0.0.1:2718:2718` ensures the port is only exposed on your machine's localhost, not to the network.

If you have these variables already set in your shell environment, you can pass them directly to the container without specifying the values:

```sh
docker run -d -p 127.0.0.1:2718:2718 \
  -e CLOUDINARY_CLOUD_NAME \
  -e CLOUDINARY_API_KEY \
  -e CLOUDINARY_API_SECRET \
  cloudinary-analysis-mcp start --transport sse --host 0.0.0.0
```

### Option 2: Using Command-Line Arguments

You can also provide the credentials as arguments to the `start` command.

```sh
docker run -d -p 127.0.0.1:2718:2718 \
  cloudinary-analysis-mcp start --transport sse --host 0.0.0.0 \
  --cloud-name "<your_cloud_name>" \
  --api-key "<your_api_key>" \
  --api-secret "<your_api_secret>"
```

### Option 3: Using `CLOUDINARY_URL` Environment Variable

This method combines all credentials into a single URL.

```sh
docker run -d -p 127.0.0.1:2718:2718 \
  -e CLOUDINARY_URL="cloudinary://<your_api_key>:<your_api_secret>@<your_cloud_name>" \
  cloudinary-analysis-mcp start --transport sse --host 0.0.0.0
```

**Note:** If you have the `CLOUDINARY_URL` variable already set in your shell environment, you can pass it directly:

```sh
docker run -d -p 127.0.0.1:2718:2718 -e CLOUDINARY_URL cloudinary-analysis-mcp start --transport sse --host 0.0.0.0
```

## Connecting to the Server

Once the container is running with the SSE transport enabled (as shown in the commands above), the MCP server is available at the following endpoint:

`http://localhost:2718/sse`

If you are running Docker on a different host, replace `localhost` with the appropriate hostname or IP address.

## Stopping the Container

You can find the container ID by running `docker ps` and then stop it using `docker stop`.

To stop the container started from the `cloudinary-analysis-mcp` image:
```sh
docker stop $(docker ps -a -q --filter "ancestor=cloudinary-analysis-mcp")
```

## Viewing Logs

You can view the logs from your running container to monitor its output or troubleshoot issues.

First, find the ID of your container:
```sh
docker ps
```
This will list all running containers, including their IDs.

### Static Logs

To see all logs that have been generated so far, use the `docker logs` command with the container ID.

```sh
docker logs <your_container_id>
```

### Live Logs

To see logs in real time, add the `--follow` (or `-f`) flag.

```sh
docker logs --follow <your_container_id>
```

Press `Ctrl+C` to stop following the logs.

## Debugging

You can enable more detailed logging for troubleshooting in two ways.

### Using the `--log-level` Flag

Set the `--log-level` flag to `debug` when starting the container.

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_URL \
  cloudinary-analysis-mcp start --transport sse --host 0.0.0.0 --log-level debug
```

### Using the `CLOUDINARY_DEBUG` Environment Variable

You can also enable a debug logger by setting the `CLOUDINARY_DEBUG` environment variable to `true`.

```sh
docker run -d -p 2718:2718 \
  -e CLOUDINARY_URL \
  -e CLOUDINARY_DEBUG=true \
  cloudinary-analysis-mcp start --transport sse --host 0.0.0.0
```

## Security Considerations

The MCP server handles your Cloudinary API credentials. To prevent unauthorized access:

- **Localhost binding (default):** When running outside Docker, the server binds to `127.0.0.1` by default, making it accessible only from your local machine.
- **Docker port mapping:** Use `-p 127.0.0.1:2718:2718` (not `-p 2718:2718`) to restrict Docker port exposure to localhost only. The broader form exposes the port to your entire network.
- **`--host 0.0.0.0`:** Only use this inside Docker containers (where it's required for port mapping) or when you explicitly need network access. Never use this on a host machine without additional access controls.
- **`--allowed-origins`:** When using the `serve` command with cross-origin clients, specify allowed origins explicitly (e.g., `--allowed-origins http://localhost:3000`) instead of allowing all origins.

