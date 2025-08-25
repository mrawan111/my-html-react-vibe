import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ServerConnectionForm = () => {
  const [serverAddress, setServerAddress] = useState<string>("");
  const [portNumber, setPortNumber] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [protocol, setProtocol] = useState<string>("");
  const [firewallAccess, setFirewallAccess] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ serverAddress, portNumber, username, password, protocol, firewallAccess });
  };

  return (
    <div className="flex-1 px-6 pt-6 space-y-6 overflow-auto">
      <h1 className="text-foreground text-xl font-bold">الاتصال بسيرفر</h1>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Server Connection Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Server Address (IP or Domain)"
              value={serverAddress}
              onChange={(e) => setServerAddress(e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Port Number"
              value={portNumber}
              onChange={(e) => setPortNumber(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Protocol/Access Tool"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Firewall/Network Access"
              value={firewallAccess}
              onChange={(e) => setFirewallAccess(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServerConnectionForm;
