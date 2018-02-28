//jasonxu-2017/10/12
package wda

import (
	"encoding/json"
	"log"
)

type SessionResponse struct {
	Value struct {
		SessionID string `json:"sessionId"`
	} `json:"value"`
	Status int `json:"status"`
}

type Status struct {
	SessionID string `json:"sessionId,omitempty"`
	Status    int    `json:"status"`
}

func (c *Client) sessionResp() (*SessionResponse, error) {
	tmpMap := make(map[string]string, 1)
	tmpMap["bundleId"] = "com.apple.calculator"
	req := make(map[string]map[string]string, 1)
	req["desiredCapabilities"] = tmpMap
	reqRaw, err := json.Marshal(req)
	log.Printf(string(reqRaw))
	if err != nil {
		return nil, err
	}
	resp, err := c.post("/session", reqRaw)
	log.Printf(string(resp))
	if err != nil {
		return nil, err
	}
	var session *SessionResponse
	err = json.Unmarshal(resp, &session)
	if err != nil {
		return nil, err
	}
	return session, nil
}

func (c *Client) getStatus() (*Status, error) {
	res, err := c.get("/status")
	if err != nil {
		return nil, err
	}
	var status *Status
	err = json.Unmarshal(res, &status)
	if err != nil {
		return nil, err
	}
	return status, nil
}

func (c *Client) getSession() (string, error) {
	status, err := c.getStatus()
	if err != nil {
		return " ", err
	}
	if status.SessionID == "" {
		resp, err := c.sessionResp()
		if err != nil {
			return " ", err
		}
		return resp.Value.SessionID, nil
	} else {
		return status.SessionID, nil
	}
}
