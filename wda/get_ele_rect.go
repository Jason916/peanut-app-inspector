// jasonxu-2017/11/19
package wda

import (
	"encoding/json"
)

type RectResponse struct {
	Value struct {
		X      float32 `json:"x"`
		Y      float32 `json:"y"`
		Width  float32 `json:"width"`
		Height float32 `json:"height"`
	} `json:"value"`
	Status int `json:"status"`
}

func (c *Client) GetEleRect(eleID string) (*RectResponse, error) {
	session, err := c.getSession()
	if err != nil {
		return nil, err
	}
	resp, err := c.get("/session/" + session + "/element/" + eleID + "/rect")
	if err != nil {
		return nil, err
	}
	var rectResp *RectResponse
	err = json.Unmarshal(resp, &rectResp)
	if err != nil {
		return nil, err
	}
	return rectResp, nil
}

func (r *RectResponse) IsAvailable() bool {
	return r.Value.X == 0 && r.Value.Y == 0 && r.Value.Width == 0 && r.Value.Height == 0
}
